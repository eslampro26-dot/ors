import fs from 'fs';
import path from 'path';
import {
  getBookings,
  getAllTrips,
  getAgents,
  getPromoCodes,
  getBankAccounts,
  getSettings,
  getSocialMedia,
  getReviews,
  saveBookings,
  saveAgents,
  savePromoCodes,
  saveBankAccounts,
  saveSettings,
  saveSocialMedia,
  updateTrip
} from './db.js';

const BACKUP_DIR = path.join(process.cwd(), 'backups');
const INDEX_FILE = path.join(BACKUP_DIR, 'index.json');
const MAX_BACKUPS_RETENTION = 30;

function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

function loadIndex() {
  ensureBackupDir();
  if (!fs.existsSync(INDEX_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(INDEX_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[backupService] Failed to read backup index:', err);
    return [];
  }
}

function saveIndex(index) {
  ensureBackupDir();
  try {
    fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2), 'utf8');
  } catch (err) {
    console.error('[backupService] Failed to write backup index:', err);
  }
}

export async function createBackupSnapshot(triggerType = 'manual', note = '') {
  ensureBackupDir();

  const timestamp = new Date().toISOString();
  const id = 'backup_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const dateStr = timestamp.split('T')[0];

  console.log('[backupService] Starting ' + triggerType + ' backup snapshot: ' + id);

  const [
    bookings,
    trips,
    agents,
    promoCodes,
    bankAccounts,
    settings,
    social,
    reviews
  ] = await Promise.all([
    getBookings().catch(() => []),
    getAllTrips().catch(() => []),
    getAgents().catch(() => []),
    getPromoCodes().catch(() => []),
    getBankAccounts().catch(() => []),
    getSettings().catch(() => ({})),
    getSocialMedia().catch(() => ({})),
    getReviews().catch(() => [])
  ]);

  const payload = {
    version: '1.0',
    id,
    timestamp,
    date: dateStr,
    triggerType,
    note: note || (triggerType === 'auto' ? 'نسخة احتياطية آلية يومية' : 'نسخة احتياطية يدوية'),
    counts: {
      bookings: bookings.length,
      trips: trips.length,
      agents: agents.length,
      promoCodes: promoCodes.length,
      bankAccounts: bankAccounts.length,
      reviews: reviews.length,
      hasSettings: Boolean(settings && Object.keys(settings).length > 0)
    },
    data: {
      bookings,
      trips,
      agents,
      promoCodes,
      bankAccounts,
      settings,
      social,
      reviews
    }
  };

  const filename = id + '.json';
  const filePath = path.join(BACKUP_DIR, filename);

  const jsonContent = JSON.stringify(payload, null, 2);
  fs.writeFileSync(filePath, jsonContent, 'utf8');
  const sizeBytes = Buffer.byteLength(jsonContent, 'utf8');

  const index = loadIndex();
  const summaryEntry = {
    id,
    filename,
    timestamp,
    date: dateStr,
    triggerType,
    note: payload.note,
    sizeBytes,
    sizeFormatted: (sizeBytes / 1024).toFixed(1) + ' KB',
    counts: payload.counts
  };

  index.unshift(summaryEntry);

  while (index.length > MAX_BACKUPS_RETENTION) {
    const old = index.pop();
    const oldPath = path.join(BACKUP_DIR, old.filename);
    if (fs.existsSync(oldPath)) {
      try {
        fs.unlinkSync(oldPath);
      } catch (err) {
        console.warn('[backupService] Failed to delete old backup:', err);
      }
    }
  }

  saveIndex(index);
  return summaryEntry;
}

export async function listBackups() {
  const index = loadIndex();
  const valid = index.filter(entry => {
    const fullPath = path.join(BACKUP_DIR, entry.filename);
    return fs.existsSync(fullPath);
  });
  if (valid.length !== index.length) {
    saveIndex(valid);
  }
  return valid;
}

export async function getBackupSnapshot(backupId) {
  ensureBackupDir();
  const filename = backupId.endsWith('.json') ? backupId : backupId + '.json';
  const filePath = path.join(BACKUP_DIR, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error('Backup file ' + filename + ' does not exist');
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

export async function deleteBackupSnapshot(backupId) {
  ensureBackupDir();
  const filename = backupId.endsWith('.json') ? backupId : backupId + '.json';
  const filePath = path.join(BACKUP_DIR, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  const index = loadIndex();
  const updated = index.filter(e => e.id !== backupId && e.filename !== filename);
  saveIndex(updated);
  return true;
}

export async function restoreBackupData(backupPayload) {
  if (!backupPayload || !backupPayload.data) {
    throw new Error('Invalid backup structure: missing data payload');
  }

  const {
    bookings,
    trips,
    agents,
    promoCodes,
    bankAccounts,
    settings,
    social
  } = backupPayload.data;

  const results = {
    bookings: false,
    trips: 0,
    agents: false,
    promoCodes: false,
    bankAccounts: false,
    settings: false,
    social: false
  };

  if (Array.isArray(bookings)) {
    results.bookings = await saveBookings(bookings);
  }

  if (Array.isArray(agents)) {
    results.agents = await saveAgents(agents);
  }

  if (Array.isArray(promoCodes)) {
    results.promoCodes = await savePromoCodes(promoCodes);
  }

  if (Array.isArray(bankAccounts)) {
    results.bankAccounts = await saveBankAccounts(bankAccounts);
  }

  if (settings && typeof settings === 'object') {
    results.settings = await saveSettings(settings);
  }

  if (social && typeof social === 'object') {
    results.social = await saveSocialMedia(social);
  }

  if (Array.isArray(trips) && trips.length > 0) {
    let restoredTripCount = 0;
    for (const trip of trips) {
      if (!trip || !trip.id) continue;
      try {
        const ok = await updateTrip(trip.id, trip);
        if (ok) restoredTripCount++;
      } catch (err) {
        console.warn('[backupService] Error restoring trip ' + trip.id + ':', err);
      }
    }
    results.trips = restoredTripCount;
  }

  return results;
}

export async function checkAndRunDailyAutoBackup() {
  try {
    const index = loadIndex();
    const today = new Date().toISOString().split('T')[0];
    
    const hasTodayAutoBackup = index.some(
      entry => entry.date === today && entry.triggerType === 'auto'
    );

    if (!hasTodayAutoBackup) {
      return await createBackupSnapshot('auto', 'نسخة احتياطية تلقائية يومية للنظام');
    }
    return null;
  } catch (err) {
    console.error('[backupService] Error in checkAndRunDailyAutoBackup:', err);
    return null;
  }
}
