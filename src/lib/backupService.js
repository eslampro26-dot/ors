import fs from 'fs';
import path from 'path';

// NOTE: We intentionally do NOT import from './db.js' here.
// db.js → db.adapter.js → db.firebase.js uses persistentLocalCache (browser IndexedDB API)
// which crashes in Node.js server context and caused HTTP 500 on this route.
// Instead we fetch data via internal HTTP API calls to existing routes.

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }
  return 'https://www.orluxus.com';
}

async function fetchJson(url, options = {}) {
  try {
    const res = await fetch(url, { ...options, cache: 'no-store' });
    if (!res.ok) {
      console.warn('[backupService] fetch ' + url + ' returned ' + res.status);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.warn('[backupService] fetch error for ' + url + ':', err.message);
    return null;
  }
}

async function fetchAllData() {
  const BASE = getBaseUrl();
  const secret = process.env.ADMIN_API_SECRET || '';
  const headers = secret ? { 'x-api-secret': secret } : {};

  const [bookingsRaw, tripsRaw, agentsRaw, promoCodesRaw, settingsRaw, reviewsRaw] =
    await Promise.all([
      fetchJson(`${BASE}/api/bookings`, { headers }),
      fetchJson(`${BASE}/api/trips?all=true`, { headers }),
      fetchJson(`${BASE}/api/agents`, { headers }),
      fetchJson(`${BASE}/api/promo-codes`, { headers }),
      fetchJson(`${BASE}/api/settings`, { headers }),
      fetchJson(`${BASE}/api/reviews`, { headers }),
    ]);

  const bookings   = Array.isArray(bookingsRaw)  ? bookingsRaw  : [];
  const trips      = Array.isArray(tripsRaw)      ? tripsRaw     : (tripsRaw?.trips || []);
  const agents     = Array.isArray(agentsRaw)     ? agentsRaw    : [];
  const promoCodes = Array.isArray(promoCodesRaw) ? promoCodesRaw : (promoCodesRaw?.codes || []);
  const reviews    = Array.isArray(reviewsRaw)    ? reviewsRaw   : [];
  const settings   = settingsRaw && typeof settingsRaw === 'object' ? settingsRaw : {};

  // /api/settings merges settings + social — split social keys back out
  const socialKeys = ['instagram','facebook','twitter','tiktok','youtube','whatsapp','telegram','snapchat'];
  const social = {};
  const settingsOnly = {};
  for (const [k, v] of Object.entries(settings)) {
    if (socialKeys.includes(k)) social[k] = v;
    else settingsOnly[k] = v;
  }

  return { bookings, trips, agents, promoCodes, bankAccounts: [], settings: settingsOnly, social, reviews };
}

async function writeAllData({ bookings, agents, promoCodes, settings, social }) {
  const BASE = getBaseUrl();
  const secret = process.env.ADMIN_API_SECRET || '';
  const jsonHeaders = {
    'Content-Type': 'application/json',
    ...(secret ? { 'x-api-secret': secret } : {})
  };
  const results = {};

  if (Array.isArray(bookings) && bookings.length > 0) {
    const r = await fetchJson(`${BASE}/api/bookings`, {
      method: 'POST', headers: jsonHeaders,
      body: JSON.stringify({ action: 'restoreAll', bookings }),
    });
    results.bookings = !!r?.success;
  }

  if (Array.isArray(agents) && agents.length > 0) {
    const r = await fetchJson(`${BASE}/api/agents`, {
      method: 'POST', headers: jsonHeaders,
      body: JSON.stringify({ action: 'restoreAll', agents }),
    });
    results.agents = !!r?.success;
  }

  if (Array.isArray(promoCodes) && promoCodes.length > 0) {
    const r = await fetchJson(`${BASE}/api/promo-codes`, {
      method: 'POST', headers: jsonHeaders,
      body: JSON.stringify({ action: 'restoreAll', codes: promoCodes }),
    });
    results.promoCodes = !!r?.success;
  }

  if (settings && typeof settings === 'object' && Object.keys(settings).length > 0) {
    const r = await fetchJson(`${BASE}/api/settings`, {
      method: 'POST', headers: jsonHeaders,
      body: JSON.stringify({ type: 'settings', data: settings }),
    });
    results.settings = !!r?.success;
  }

  if (social && typeof social === 'object' && Object.keys(social).length > 0) {
    const r = await fetchJson(`${BASE}/api/settings`, {
      method: 'POST', headers: jsonHeaders,
      body: JSON.stringify({ type: 'social', data: social }),
    });
    results.social = !!r?.success;
  }

  return results;
}

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

  const { bookings, trips, agents, promoCodes, bankAccounts, settings, social, reviews } =
    await fetchAllData();

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

  const { bookings, trips, agents, promoCodes, settings, social } = backupPayload.data;

  const results = await writeAllData({ bookings, agents, promoCodes, settings, social });

  // Trips are stored in Firestore directly via trips API — record count for report
  if (Array.isArray(trips)) {
    results.trips = trips.length;
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
