import os from 'os';
import path from 'path';
import fs from 'fs';
import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
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

// Use os.tmpdir() to guarantee writability on serverless (Vercel, AWS) and local dev
// NEVER use process.cwd() as /var/task is read-only on serverless!
const BACKUP_DIR = path.join(os.tmpdir(), 'orluxus-backups');
const INDEX_FILE = path.join(BACKUP_DIR, 'index.json');
const MAX_BACKUPS_RETENTION = 30;
const FIRESTORE_COL = 'system_backups';

// ── Safe local filesystem helpers (wrapped in try/catch to never throw) ──────────

function ensureBackupDir() {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('[backupService] Warning: local tmp directory could not be created:', err?.message);
  }
}

function safeSaveLocalIndex(index) {
  try {
    ensureBackupDir();
    fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2), 'utf8');
  } catch (_) {}
}

function safeLoadLocalIndex() {
  try {
    ensureBackupDir();
    if (fs.existsSync(INDEX_FILE)) {
      const raw = fs.readFileSync(INDEX_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (_) {}
  return [];
}

// ── Public Backup Engine APIs ───────────────────────────────────────────────────

/**
 * Creates a complete snapshot of all site data and stores it in Firestore (and local tmp).
 */
export async function createBackupSnapshot(triggerType = 'manual', note = '') {
  const timestamp = new Date().toISOString();
  const id = 'backup_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const dateStr = timestamp.split('T')[0];

  console.log('[backupService] Starting ' + triggerType + ' backup snapshot: ' + id);

  // 1. Gather all collections concurrently
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
    filename: id + '.json',
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

  const jsonContent = JSON.stringify(payload);
  const sizeBytes = Buffer.byteLength(jsonContent, 'utf8');
  const sizeFormatted = (sizeBytes / 1024).toFixed(1) + ' KB';

  const summaryEntry = {
    id,
    filename: id + '.json',
    timestamp,
    date: dateStr,
    triggerType,
    note: payload.note,
    sizeBytes,
    sizeFormatted,
    counts: payload.counts
  };

  // 2. Primary: Save document directly to Firebase Firestore
  if (db) {
    try {
      await setDoc(doc(db, FIRESTORE_COL, id), {
        ...payload,
        sizeBytes,
        sizeFormatted
      });
      console.log('[backupService] Snapshot saved successfully to Firestore:', id);

      // Prune backups beyond MAX_BACKUPS_RETENTION (oldest first)
      try {
        const q = query(collection(db, FIRESTORE_COL), orderBy('timestamp', 'desc'));
        const snap = await getDocs(q);
        if (snap.docs.length > MAX_BACKUPS_RETENTION) {
          const oldDocs = snap.docs.slice(MAX_BACKUPS_RETENTION);
          for (const oldDoc of oldDocs) {
            await deleteDoc(oldDoc.ref).catch(() => {});
          }
        }
      } catch (pruneErr) {
        console.warn('[backupService] Warning during backup pruning:', pruneErr?.message);
      }
    } catch (err) {
      console.error('[backupService] Error saving backup to Firestore:', err);
    }
  }

  // 3. Secondary: Cache copy in tmp directory (purely optional, never fails request)
  try {
    ensureBackupDir();
    fs.writeFileSync(path.join(BACKUP_DIR, id + '.json'), jsonContent, 'utf8');
    const localIndex = safeLoadLocalIndex();
    localIndex.unshift(summaryEntry);
    while (localIndex.length > MAX_BACKUPS_RETENTION) {
      const old = localIndex.pop();
      try {
        fs.unlinkSync(path.join(BACKUP_DIR, old.filename));
      } catch (_) {}
    }
    safeSaveLocalIndex(localIndex);
  } catch (tmpErr) {
    console.warn('[backupService] Local tmp cache notice:', tmpErr?.message);
  }

  return summaryEntry;
}

/**
 * Lists available backups. Queries Firestore first, falls back to local tmp.
 */
export async function listBackups() {
  // 1. Primary: Load from Firestore
  if (db) {
    try {
      const q = query(
        collection(db, FIRESTORE_COL),
        orderBy('timestamp', 'desc'),
        limit(MAX_BACKUPS_RETENTION)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const list = snap.docs.map(docSnap => {
          const d = docSnap.data();
          return {
            id: d.id || docSnap.id,
            filename: d.filename || (docSnap.id + '.json'),
            timestamp: d.timestamp,
            date: d.date,
            triggerType: d.triggerType || 'manual',
            note: d.note || '',
            sizeBytes: d.sizeBytes || 0,
            sizeFormatted: d.sizeFormatted || '0 KB',
            counts: d.counts || {}
          };
        });
        return list;
      }
    } catch (err) {
      console.warn('[backupService] Firestore listBackups notice:', err?.message);
    }
  }

  // 2. Fallback: Load from local tmp
  return safeLoadLocalIndex();
}

/**
 * Retrieves full snapshot payload (including data object).
 */
export async function getBackupSnapshot(backupId) {
  const cleanId = String(backupId || '').replace(/\.json$/, '');
  if (!cleanId) throw new Error('Missing backup ID');

  // 1. Primary: Load from Firestore
  if (db) {
    try {
      const snap = await getDoc(doc(db, FIRESTORE_COL, cleanId));
      if (snap.exists()) {
        return snap.data();
      }
    } catch (err) {
      console.warn('[backupService] Firestore getBackupSnapshot notice:', err?.message);
    }
  }

  // 2. Fallback: Load from local tmp
  try {
    ensureBackupDir();
    const filePath = path.join(BACKUP_DIR, cleanId + '.json');
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(raw);
    }
  } catch (_) {}

  throw new Error('Backup snapshot ' + cleanId + ' not found');
}

/**
 * Deletes a backup snapshot from Firestore and local tmp.
 */
export async function deleteBackupSnapshot(backupId) {
  const cleanId = String(backupId || '').replace(/\.json$/, '');
  if (!cleanId) return false;

  // 1. Delete from Firestore
  if (db) {
    try {
      await deleteDoc(doc(db, FIRESTORE_COL, cleanId));
    } catch (err) {
      console.warn('[backupService] Firestore deleteDoc notice:', err?.message);
    }
  }

  // 2. Delete from local tmp
  try {
    ensureBackupDir();
    const filePath = path.join(BACKUP_DIR, cleanId + '.json');
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    const index = safeLoadLocalIndex().filter(e => e.id !== cleanId && e.filename !== cleanId + '.json');
    safeSaveLocalIndex(index);
  } catch (_) {}

  return true;
}

/**
 * Restores database state from a backup snapshot payload.
 */
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
    results.bookings = await saveBookings(bookings).catch(() => false);
  }

  if (Array.isArray(agents)) {
    results.agents = await saveAgents(agents).catch(() => false);
  }

  if (Array.isArray(promoCodes)) {
    results.promoCodes = await savePromoCodes(promoCodes).catch(() => false);
  }

  if (Array.isArray(bankAccounts)) {
    results.bankAccounts = await saveBankAccounts(bankAccounts).catch(() => false);
  }

  if (settings && typeof settings === 'object') {
    results.settings = await saveSettings(settings).catch(() => false);
  }

  if (social && typeof social === 'object') {
    results.social = await saveSocialMedia(social).catch(() => false);
  }

  if (Array.isArray(trips) && trips.length > 0) {
    let restoredTripCount = 0;
    for (const trip of trips) {
      if (!trip || !trip.id) continue;
      try {
        const ok = await updateTrip(trip.id, trip);
        if (ok) restoredTripCount++;
      } catch (err) {
        console.warn('[backupService] Error restoring trip ' + trip.id + ':', err?.message);
      }
    }
    results.trips = restoredTripCount;
  }

  return results;
}

/**
 * Checks if a daily automated backup exists for today.
 * If not, automatically creates one.
 */
export async function checkAndRunDailyAutoBackup() {
  try {
    const today = new Date().toISOString().split('T')[0];

    // 1. Check Firestore for today's auto backup
    if (db) {
      try {
        const q = query(
          collection(db, FIRESTORE_COL),
          where('date', '==', today),
          where('triggerType', '==', 'auto'),
          limit(1)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          // Today's auto backup already exists
          return null;
        }
      } catch (err) {
        console.warn('[backupService] Auto backup check notice:', err?.message);
      }
    }

    // 2. Fallback: check local tmp index
    const localIndex = safeLoadLocalIndex();
    const hasTodayLocal = localIndex.some(
      entry => entry.date === today && entry.triggerType === 'auto'
    );
    if (hasTodayLocal) {
      return null;
    }

    // 3. Create today's automatic backup
    return await createBackupSnapshot('auto', 'نسخة احتياطية تلقائية يومية للنظام');
  } catch (err) {
    console.warn('[backupService] Error in checkAndRunDailyAutoBackup:', err?.message);
    return null;
  }
}
