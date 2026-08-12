
// Firebase Firestore persistence layer - replaces localStorage
import { db } from './firebase';
import { 
  collection, doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  writeBatch,
  query, where, orderBy, limit, onSnapshot, increment
} from 'firebase/firestore';
import { sampleTrips } from './data';

// Helper for exact local date YYYY-MM-DD (prevents UTC timezone offset date shift)
export function getLocalDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ==========================================
// CIRCUIT BREAKER - منع تكرار أخطاء Firebase
// ==========================================
const _circuitBreaker = {
  tripped: false,        // هل تم تفعيل القاطع؟
  trippedAt: null,       // متى تم تفعيله؟
  resetAfterMs: 60000,   // إعادة المحاولة بعد 60 ثانية
  errorLogged: false,    // هل تم طباعة رسالة الخطأ؟

  isOpen() {
    if (!this.tripped) return false;
    // إعادة الضبط التلقائي بعد المدة المحددة
    if (Date.now() - this.trippedAt > this.resetAfterMs) {
      this.tripped = false;
      this.errorLogged = false;
      return false;
    }
    return true;
  },

  trip(error) {
    this.tripped = true;
    this.trippedAt = Date.now();
    if (!this.errorLogged) {
      this.errorLogged = true;
      const isPermissionError = error?.message?.includes('permission') || error?.code === 'permission-denied';
      if (isPermissionError) {
        console.warn(
          '[ORLUXUS] Firebase Firestore: صلاحيات القراءة غير متاحة.\n' +
          'سيتم استخدام البيانات المحلية (sampleTrips) كبديل.\n' +
          'لتفعيل Firebase: عدّل Firestore Security Rules من لوحة Firebase Console.'
        );
      } else {
        console.warn('[ORLUXUS] Firebase غير متاح - يتم استخدام البيانات المحلية كبديل:', error?.message);
      }
    }
  }
};

// Read operations: no artificial timeout - let Firestore use its native offline cache
// Write operations: generous 60s safety limit to prevent hanging
const WRITE_TIMEOUT_MS = 60000;

async function withWriteTimeout(promise) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Firebase write timed out after 60s')), WRITE_TIMEOUT_MS);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
  }
}

// Reads: pure Firestore (uses offline cache automatically on slow/no network)
const safeGetDoc = (ref) => getDoc(ref);
const safeGetDocs = (q) => getDocs(q);
// Writes: 60s safety timeout
const safeSetDoc = (ref, data, options) => withWriteTimeout(setDoc(ref, data, options));
const safeAddDoc = (collRef, data) => withWriteTimeout(addDoc(collRef, data));
const safeUpdateDoc = (ref, data) => withWriteTimeout(updateDoc(ref, data));
const safeDeleteDoc = (ref) => withWriteTimeout(deleteDoc(ref));
const safeWriteBatch = (firestoreDb) => {
  const batch = writeBatch(firestoreDb);
  const originalCommit = batch.commit.bind(batch);
  batch.commit = () => withWriteTimeout(originalCommit());
  return batch;
};

// ==========================================
// COLLECTION NAMES
// ==========================================
const COL = {
  TRIPS: 'trips',
  PACKAGES: 'packages',
  AGENTS: 'agents',
  BOOKINGS: 'bookings',
  PROMO_CODES: 'promo_codes',
  REVIEWS: 'reviews',
  SOCIAL: 'social_media',
  SETTINGS: 'settings',
};

// ==========================================
// HELPER: Safe async wrapper
// ==========================================
function safeAsync(fn) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (e) {
      console.error('Firebase operation failed:', e);
      return null;
    }
  };
}

// ==========================================
// INITIALIZATION - Seed default data
// ==========================================
const DEFAULT_AGENTS = [
  { id: '1', name: 'أحمد محمود', email: 'ahmed@example.com', username: 'ahmed', password: 'Agent@2026!Sec', tier: 'silver', sales: 105000, subAgents: 3, joinDate: '2026-01-10', status: 'نشط', parentId: '5', promoCodes: ['AHMED10'] },
  { id: '2', name: 'سارة إبراهيم', email: 'sara@example.com', username: 'sara', password: 'Agent@2026!Sec', tier: 'gold', sales: 98500, subAgents: 0, joinDate: '2025-11-20', status: 'نشط', parentId: '5', promoCodes: ['SARA20'] },
  { id: '3', name: 'خالد عبد الرحمن', email: 'khaled@example.com', username: 'khaled', password: 'Agent@2026!Sec', tier: 'silver', sales: 85200, subAgents: 0, joinDate: '2026-02-05', status: 'نشط', parentId: '5', promoCodes: ['KHALED15'] },
  { id: '4', name: 'منى جمال', email: 'mona@example.com', username: 'mona', password: 'Agent@2026!Sec', tier: 'bronze', sales: 75000, subAgents: 0, joinDate: '2026-03-15', status: 'موقوف', parentId: '1', promoCodes: ['MONA5'] },
  { id: '5', name: 'طارق زياد', email: 'tarek@example.com', username: 'tarek', password: 'Agent@2026!Sec', tier: 'platinum', sales: 250000, subAgents: 4, joinDate: '2025-05-10', status: 'نشط', parentId: null, promoCodes: ['TAREK25'] },
  { id: '6', name: 'يوسف سليم', email: 'youssef@example.com', username: 'youssef', password: 'Agent@2026!Sec', tier: 'bronze', sales: 20000, subAgents: 0, joinDate: '2026-04-01', status: 'نشط', parentId: '1', promoCodes: ['YOUSSEF10'] },
  { id: '7', name: 'حازم عمر', email: 'hazem@example.com', username: 'hazem', password: 'Agent@2026!Sec', tier: 'bronze', sales: 12000, subAgents: 0, joinDate: '2026-04-10', status: 'نشط', parentId: '1', promoCodes: ['HAZEM10'] },
];

const DEFAULT_PROMO_CODES = [
  { code: 'AHMED10', agentId: '1', discountType: 'percentage', discountValue: 10, maxUses: 100, usedCount: 5, isActive: true, expiryDate: '2026-12-31', createdAt: '2026-01-10', createdBy: 'admin' },
  { code: 'SARA20', agentId: '2', discountType: 'percentage', discountValue: 20, maxUses: 50, usedCount: 12, isActive: true, expiryDate: '2026-12-31', createdAt: '2025-11-20', createdBy: 'admin' },
  { code: 'KHALED15', agentId: '3', discountType: 'percentage', discountValue: 15, maxUses: 100, usedCount: 8, isActive: true, expiryDate: '2026-12-31', createdAt: '2026-02-05', createdBy: 'admin' },
  { code: 'MONA5', agentId: '4', discountType: 'percentage', discountValue: 5, maxUses: 200, usedCount: 3, isActive: true, expiryDate: '2026-12-31', createdAt: '2026-03-15', createdBy: 'admin' },
  { code: 'TAREK25', agentId: '5', discountType: 'percentage', discountValue: 25, maxUses: 50, usedCount: 22, isActive: true, expiryDate: '2026-12-31', createdAt: '2025-05-10', createdBy: 'admin' },
  { code: 'YOUSSEF10', agentId: '6', discountType: 'percentage', discountValue: 10, maxUses: 100, usedCount: 2, isActive: true, expiryDate: '2026-12-31', createdAt: '2026-04-01', createdBy: 'admin' },
  { code: 'HAZEM10', agentId: '7', discountType: 'percentage', discountValue: 10, maxUses: 100, usedCount: 1, isActive: true, expiryDate: '2026-12-31', createdAt: '2026-04-10', createdBy: 'admin' },
];

const DEFAULT_BOOKINGS = [
  { id: 'BK-1001', date: '2026-05-21', customer: 'محمد علي', phone: '01012345678', whatsapp: '01012345678', service: 'رحلة جزيرة تيران', city: 'شرم الشيخ', agentId: '1', agentName: 'أحمد محمود', originalAmount: 70, discountAmount: 7, finalAmount: 63, travelers: 2, status: 'مؤكد', promoCode: 'AHMED10', paymentType: 'paypal', txId: 'pp-tx-1001' },
  { id: 'BK-1002', date: '2026-05-21', customer: 'سارة إبراهيم', phone: '01123456789', whatsapp: '01123456789', service: 'عشاء بدوي مع عرض', city: 'شرم الشيخ', agentId: null, agentName: 'مباشر (بدون وكيل)', originalAmount: 30, discountAmount: 0, finalAmount: 30, travelers: 1, status: 'قيد الانتظار', promoCode: '', paymentType: 'cash', txId: 'cash-tx-1002' },
  { id: 'BK-1003', date: '2026-05-20', customer: 'كريم مصطفى', phone: '01234567890', whatsapp: '01234567890', service: 'سفاري رباعي الدفع', city: 'الغردقة', agentId: '3', agentName: 'خالد عبد الرحمن', originalAmount: 80, discountAmount: 12, finalAmount: 68, travelers: 2, status: 'مكتمل', promoCode: 'KHALED15', paymentType: 'paypal', txId: 'pp-tx-1003' },
  { id: 'BK-1004', date: '2026-05-20', customer: 'منى يوسف', phone: '01512345678', whatsapp: '01512345678', service: 'رحلة جزيرة الجفتون', city: 'الغردقة', agentId: '2', agentName: 'سارة إبراهيم', originalAmount: 50, discountAmount: 10, finalAmount: 40, travelers: 2, status: 'مؤكد', promoCode: 'SARA20', paymentType: 'paypal', txId: 'pp-tx-1004' },
  { id: 'BK-1005', date: '2026-05-19', customer: 'طارق حسن', phone: '01098765432', whatsapp: '01098765432', service: 'غوص للمبتدئين', city: 'مرسى علم', agentId: '1', agentName: 'أحمد محمود', originalAmount: 50, discountAmount: 5, finalAmount: 45, travelers: 1, status: 'ملغي', promoCode: 'AHMED10', paymentType: 'cash', txId: 'cash-tx-1005' },
];

const DEFAULT_REVIEWS = [
  { id: 'rev-1', name: 'Sophie L.', country: 'France', rating: 5, text: 'Absolutely spectacular yacht trip. The family atmosphere made us feel so safe and welcomed.', date: '2026-05-20', image: null },
  { id: 'rev-2', name: 'Michael K.', country: 'Germany', rating: 5, text: 'Seamless reservation via PayPal, instant PDF invoice, and the private airport transfer was punctual.', date: '2026-05-18', image: null },
  { id: 'rev-3', name: 'Ahmed A.', country: 'Egypt', rating: 5, text: 'Best safari in Sharm El Sheikh. Outstanding organization, and very respectful staff.', date: '2026-05-15', image: null }
];

const DEFAULT_SOCIAL = {
  email: 'info@orluxus.com',
  facebook: 'https://facebook.com/orluxus',
  tiktok: 'https://www.tiktok.com/@orluxus?_r=1&_t=ZS-979ayAlnRlV',
  instagram: 'https://www.instagram.com/orluxus?igsh=N2lmbmg2eGJzNmVx'
};

const DEFAULT_SETTINGS = {
  siteName: 'ORLUXUS',
  whatsapp: '+20100000000',
  paypalEmail: 'info@orluxus.com',
  smtpHost: 'smtp.gmail.com',
  smtpPort: '587',
  smtpUser: '',
  smtpPass: '',
  companyEmail: 'info@orluxus.com',
  additionalPrices: {
    'sea-trips': { economy: 20, business: 35, vip: 50 },
    'desert-trips': { economy: 15, business: 25, vip: 40 },
    'city-tours': { economy: 10, business: 20, vip: 30 },
    'packages': { economy: 50, business: 100, vip: 150 },
    'restaurants': { economy: 10, business: 20, vip: 35 },
    'entertainment': { economy: 15, business: 30, vip: 50 }
  },
  childPrices: {
    'sea-trips': { economy: 10, business: 18, vip: 25 },
    'desert-trips': { economy: 8, business: 13, vip: 20 },
    'city-tours': { economy: 5, business: 10, vip: 15 },
    'packages': { economy: 25, business: 50, vip: 75 },
    'restaurants': { economy: 5, business: 10, vip: 18 },
    'entertainment': { economy: 8, business: 15, vip: 25 }
  },
  infantPrices: {
    'sea-trips': { economy: 0, business: 0, vip: 0 },
    'desert-trips': { economy: 0, business: 0, vip: 0 },
    'city-tours': { economy: 0, business: 0, vip: 0 },
    'packages': { economy: 0, business: 0, vip: 0 },
    'restaurants': { economy: 0, business: 0, vip: 0 },
    'entertainment': { economy: 0, business: 0, vip: 0 }
  }
};


export async function initializeDB() {
  try {
    // Check if already seeded
    const metaDoc = await getDoc(doc(db, '_meta', 'initialized'));
    if (metaDoc.exists()) return;

    const batch = safeWriteBatch(db);

    // Seed agents
    const bcrypt = require('bcryptjs');
    const salt = bcrypt.genSaltSync(10);
    for (const agent of DEFAULT_AGENTS) {
      let hashedPassword = agent.password;
      if (hashedPassword && !hashedPassword.startsWith('$2a$') && !hashedPassword.startsWith('$2b$')) {
        hashedPassword = bcrypt.hashSync(hashedPassword, salt);
      }
      batch.set(doc(db, COL.AGENTS, agent.id), { ...agent, password: hashedPassword });
    }

    // Seed promo codes
    for (const code of DEFAULT_PROMO_CODES) {
      batch.set(doc(db, COL.PROMO_CODES, code.code), code);
    }

    // Seed bookings
    for (const booking of DEFAULT_BOOKINGS) {
      batch.set(doc(db, COL.BOOKINGS, booking.id), booking);
    }

    // Seed reviews
    for (const review of DEFAULT_REVIEWS) {
      batch.set(doc(db, COL.REVIEWS, review.id), review);
    }

    // Seed social media
    batch.set(doc(db, COL.SOCIAL, 'main'), DEFAULT_SOCIAL);

    // Seed settings
    batch.set(doc(db, COL.SETTINGS, 'main'), DEFAULT_SETTINGS);

    // Mark as initialized
    batch.set(doc(db, '_meta', 'initialized'), { 
      seededAt: new Date().toISOString(),
      databaseId: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID || databaseId
    });

    await batch.commit();
    console.log('Firebase DB seeded successfully with database ID:', process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID || databaseId);
    return true;
  } catch (e) {
    console.error('Error seeding Firebase DB:', e);
    return false;
  }
}

// ==========================================
// ==========================================
// TRIPS CRUD
// ==========================================

export async function getTrips(slug, category) {
  const cleanSlug = String(slug || '').toLowerCase();
  const cleanCat = String(category || '').toLowerCase();
  const staticTrips = (sampleTrips[cleanSlug] && sampleTrips[cleanSlug][cleanCat]) || [];

  try {
    const snapshot = await safeGetDocs(collection(db, COL.TRIPS));
    if (!snapshot || snapshot.empty) return staticTrips;

    const allCustomDocs = snapshot.docs.map(d => {
      const data = d.data();
      return {
        id: data.id || d.id,
        firestoreDocId: d.id,
        ...data,
        economyDesc: data.economyDesc || '',
        businessDesc: data.businessDesc || '',
        vipDesc: data.vipDesc || ''
      };
    });

    // 1. Filter deleted tombstones SCOPED TO THIS CITY & CATEGORY
    const deletedIds = new Set(
      allCustomDocs
        .filter(t => t.deleted && (
          !t.slug || String(t.slug).toLowerCase() === cleanSlug
        ) && (
          !t.category || String(t.category).toLowerCase() === cleanCat
        ))
        .map(t => String(t.id))
    );

    // 2. Filter custom/edited docs SCOPED TO THIS CITY & CATEGORY
    const categoryTrips = allCustomDocs.filter(t =>
      !t.deleted &&
      String(t.slug || '').toLowerCase() === cleanSlug &&
      String(t.category || '').toLowerCase() === cleanCat
    );

    const customTripMap = new Map();
    categoryTrips.forEach(t => {
      customTripMap.set(String(t.id), t);
    });

    // 3. Merge static trips with custom/edited docs
    const mergedStaticTrips = staticTrips
      .filter(st => !deletedIds.has(String(st.id)))
      .map(st => {
        const edited = customTripMap.get(String(st.id));
        return edited ? { ...st, ...edited } : st;
      });

    // 4. Add brand-new custom trips (IDs not in staticTrips), excluding deleted
    const staticTripIds = new Set(staticTrips.map(st => String(st.id)));
    const brandNewTrips = categoryTrips.filter(
      ct => !staticTripIds.has(String(ct.id)) && !deletedIds.has(String(ct.id))
    );

    return [...mergedStaticTrips, ...brandNewTrips];
  } catch (e) {
    console.error('Error in getTrips:', e);
    return staticTrips;
  }
}

export async function getAllTrips() {
  try {
    const snapshot = await safeGetDocs(collection(db, COL.TRIPS));
    if (!snapshot || snapshot.empty) return [];
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() })).filter(t => !t.deleted);
  } catch (e) {
    console.error('Error in getAllTrips:', e);
    return [];
  }
}

export async function addTrip(slug, category, tripData) {
  try {
    const cleanSlug = String(slug || tripData.slug || tripData.city || '').toLowerCase().trim();
    const cleanCat = String(category || tripData.category || '').toLowerCase().trim();
    const newId = tripData.id || `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newTrip = {
      currency: 'EUR',
      rating: 5.0,
      reviews: 1,
      image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
      createdAt: new Date().toISOString(),
      ...tripData,
      id: newId,
      slug: cleanSlug,
      category: cleanCat,
    };
    await safeSetDoc(doc(db, COL.TRIPS, String(newId)), newTrip, { merge: true });
    if (cleanSlug && cleanCat && !String(newId).startsWith('custom')) {
      await safeSetDoc(doc(db, COL.TRIPS, `${cleanSlug}_${cleanCat}_${newId}`), newTrip, { merge: true });
    }
    console.log('Trip added successfully with ID:', newId, 'slug:', cleanSlug, 'category:', cleanCat);
    return { id: newId, ...newTrip };
  } catch (e) {
    console.error('Error saving trip to Firebase:', e);
    return false;
  }
}

export async function getAgentById(id) {
  if (!id) return null;
  const idStr = String(id).trim();
  try {
    const snap = await safeGetDoc(doc(db, COL.AGENTS, idStr));
    if (snap && snap.exists()) return { id: snap.id, ...snap.data() };

    const snapshot = await safeGetDocs(collection(db, COL.AGENTS));
    if (snapshot && !snapshot.empty) {
      const match = snapshot.docs.find(d => String(d.id) === idStr || String(d.data().id) === idStr);
      if (match) return { id: match.id, ...match.data() };
      return null;
    }
    const fallback = DEFAULT_AGENTS.find(a => String(a.id) === idStr);
    return fallback ? { ...fallback } : null;
  } catch (e) {
    const fallback = DEFAULT_AGENTS.find(a => String(a.id) === idStr);
    return fallback ? { ...fallback } : null;
  }
}

export async function updateTrip(tripId, tripData) {
  try {
    const tripIdStr = String(tripId);
    let slug = String(tripData.slug || tripData.city || '').toLowerCase().trim();
    let category = String(tripData.category || '').toLowerCase().trim();

    // If slug or category are missing, lookup existing doc to preserve city/category
    if (!slug || !category) {
      try {
        const snapshot = await safeGetDocs(collection(db, COL.TRIPS));
        if (snapshot && !snapshot.empty) {
          const match = snapshot.docs.find(d => String(d.id) === tripIdStr || String(d.data().id) === tripIdStr);
          if (match) {
            const existingData = match.data();
            if (!slug) slug = String(existingData.slug || existingData.city || '').toLowerCase().trim();
            if (!category) category = String(existingData.category || '').toLowerCase().trim();
          }
        }
      } catch (_) {}
    }

    const dataToSave = {
      ...tripData,
      id: tripIdStr,
      slug,
      category
    };

    // Composite doc ID for deterministic city-scoped storage
    const targetDocId = (tripIdStr.startsWith('custom') || !slug || !category) ? tripIdStr : `${slug}_${category}_${tripIdStr}`;

    await safeSetDoc(doc(db, COL.TRIPS, targetDocId), dataToSave, { merge: true });
    // Also save under raw tripIdStr to ensure backwards compatibility
    if (targetDocId !== tripIdStr) {
      await safeSetDoc(doc(db, COL.TRIPS, tripIdStr), dataToSave, { merge: true });
    }
    console.log('Trip updated in Firestore with docId:', targetDocId);
    return true;
  } catch (e) {
    console.error('Error updating trip:', e);
    return false;
  }
}


export async function deleteTrip(slug, category, tripId) {
  try {
    const tripIdStr = String(tripId);
    const cleanSlug = String(slug).toLowerCase();
    const cleanCat = String(category).toLowerCase();

    // 1. Delete matching doc
    const targetDocId = `${cleanSlug}_${cleanCat}_${tripIdStr}`;
    await safeDeleteDoc(doc(db, COL.TRIPS, targetDocId));
    await safeDeleteDoc(doc(db, COL.TRIPS, tripIdStr));

    // 2. Create scoped tombstone document so static sample trips in THIS city/category are hidden permanently
    await safeSetDoc(doc(db, COL.TRIPS, `del_${cleanSlug}_${cleanCat}_${tripIdStr}`), {
      id: tripIdStr,
      slug: cleanSlug,
      category: cleanCat,
      deleted: true,
      deletedAt: new Date().toISOString()
    });

    return true;
  } catch (e) {
    console.error('Error deleting trip:', e);
    return false;
  }
}

// ==========================================
// PACKAGES CRUD
// ==========================================

export async function getPackages(pkgId) {
  try {
    const snapshot = await safeGetDocs(collection(db, COL.PACKAGES));
    if (!snapshot || snapshot.empty) return [];

    const allDocs = snapshot.docs.map(d => ({
      id: d.data().id || d.id,
      firestoreDocId: d.id,
      ...d.data()
    }));

    const deletedIds = new Set(
      allDocs.filter(p => p.deleted).map(p => String(p.id))
    );

    const filtered = allDocs.filter(
      p => String(p.pkgId) === String(pkgId) && !p.deleted && !deletedIds.has(String(p.id))
    );

    return filtered;
  } catch (e) {
    console.error('Error fetching packages:', e);
    return [];
  }
}

export async function addPackage(pkgId, packageData) {
  try {
    const newId = packageData.id || `pkg_custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newPackage = {
      id: newId,
      pkgId: String(pkgId),
      currency: 'EUR',
      rating: 5.0,
      reviews: 1,
      icon: packageData.icon || '✈️',
      createdAt: new Date().toISOString(),
      ...packageData,
    };
    await safeSetDoc(doc(db, COL.PACKAGES, String(newId)), newPackage, { merge: true });
    console.log('Package added successfully with ID:', newId);
    return { id: newId, ...newPackage };
  } catch (e) {
    console.error('Error saving package to Firebase:', e);
    return false;
  }
}

export async function updatePackage(pkgId, packageId, packageData) {
  try {
    const pkgIdStr = String(packageId);
    const pkgRef = doc(db, COL.PACKAGES, pkgIdStr);
    const snap = await safeGetDoc(pkgRef);
    if (snap && snap.exists()) {
      await safeUpdateDoc(pkgRef, packageData);
      console.log('Package updated successfully with ID:', pkgIdStr);
      return true;
    }

    const snapshot = await safeGetDocs(collection(db, COL.PACKAGES));
    if (snapshot && !snapshot.empty) {
      const match = snapshot.docs.find(d => d.id === pkgIdStr || String(d.data().id) === pkgIdStr);
      if (match) {
        await safeUpdateDoc(doc(db, COL.PACKAGES, match.id), packageData);
        console.log('Package updated via matching doc ID:', match.id);
        return true;
      }
    }

    // Upsert fallback
    await safeSetDoc(pkgRef, { id: pkgIdStr, pkgId: String(pkgId), ...packageData }, { merge: true });
    console.log('Package upserted with ID:', pkgIdStr);
    return true;
  } catch (e) {
    console.error('Error updating package:', e);
    return false;
  }
}

export async function deletePackage(pkgId, packageId) {
  try {
    const pkgIdStr = String(packageId);
    
    // 1. Try to delete document by ID directly
    const pkgRef = doc(db, COL.PACKAGES, pkgIdStr);
    const snap = await safeGetDoc(pkgRef);
    if (snap && snap.exists()) {
      await safeDeleteDoc(pkgRef);
    }

    // 2. Delete all matching docs by id
    const snapshot = await safeGetDocs(collection(db, COL.PACKAGES));
    if (snapshot && !snapshot.empty) {
      const matches = snapshot.docs.filter(d => d.id === pkgIdStr || String(d.data().id) === pkgIdStr);
      for (const m of matches) {
        await safeDeleteDoc(doc(db, COL.PACKAGES, m.id));
      }
    }

    // 3. Write tombstone doc so deleted packages stay deleted
    await safeSetDoc(doc(db, COL.PACKAGES, `del_pkg_${pkgId}_${pkgIdStr}`), {
      id: pkgIdStr,
      pkgId: String(pkgId),
      deleted: true,
      deletedAt: new Date().toISOString()
    });

    return true;
  } catch (e) {
    console.error('Error deleting package:', e);
    return false;
  }
}

// ==========================================
// AGENTS CRUD
// ==========================================

export async function getAgents() {
  try {
    const snapshot = await getDocs(collection(db, COL.AGENTS));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    // Silently fallback to LS on timeout
    return DEFAULT_AGENTS;
  }
}

export async function saveAgents(agents) {
  try {
    const batch = safeWriteBatch(db);
    // Delete all existing then write new
    const existing = await getDocs(collection(db, COL.AGENTS));
    existing.docs.forEach(d => batch.delete(d.ref));
    agents.forEach(agent => {
      const id = String(agent.id);
      batch.set(doc(db, COL.AGENTS, id), { ...agent, id });
    });
    await batch.commit();
    return true;
  } catch (e) {
    console.error('Error saving agents:', e);
    return false;
  }
}



export async function getAgentByUsername(username) {
  if (!username) return null;
  const clean = String(username).trim().toLowerCase();
  try {
    const snapshot = await safeGetDocs(collection(db, COL.AGENTS));
    if (snapshot && !snapshot.empty) {
      const match = snapshot.docs.find(d => {
        const data = d.data();
        const u = String(data.username || '').trim().toLowerCase();
        const e = String(data.email || '').trim().toLowerCase();
        const n = String(data.name || '').trim().toLowerCase();
        return u === clean || e === clean || n === clean;
      });
      if (match) return { id: match.id, ...match.data() };
      // Collection exists and has docs — do not match wrong hardcoded defaults
      return null;
    }
    const fallback = DEFAULT_AGENTS.find(a =>
      String(a.username || '').trim().toLowerCase() === clean ||
      String(a.email || '').trim().toLowerCase() === clean ||
      String(a.name || '').trim().toLowerCase() === clean
    );
    return fallback ? { ...fallback } : null;
  } catch (e) {
    const clean = String(username).trim().toLowerCase();
    const fallback = DEFAULT_AGENTS.find(a =>
      String(a.username || '').trim().toLowerCase() === clean ||
      String(a.email || '').trim().toLowerCase() === clean ||
      String(a.name || '').trim().toLowerCase() === clean
    );
    return fallback ? { ...fallback } : null;
  }
}

export async function addAgent(agentData) {
  try {
    const snapshot = await safeGetDocs(collection(db, COL.AGENTS));
    const agents = (snapshot && !snapshot.empty) ? snapshot.docs.map(d => ({ id: d.id, ...d.data() })) : [];
    const numericIds = agents.map(a => parseInt(a.id, 10)).filter(n => !isNaN(n) && n > 0);
    const maxNumeric = numericIds.length > 0 ? Math.max(...numericIds, 7) : 7;
    const id = String(maxNumeric + 1);

    // Hash password if not already hashed
    let hashedPassword = agentData.password;
    if (hashedPassword && !hashedPassword.startsWith('$2a$') && !hashedPassword.startsWith('$2b$')) {
      const bcrypt = require('bcryptjs');
      const salt = bcrypt.genSaltSync(10);
      hashedPassword = bcrypt.hashSync(hashedPassword, salt);
    }

    // Auto-generate unique promo code if not provided
    let promoCodes = agentData.promoCodes || [];
    if (!promoCodes.length) {
      const prefix = String(agentData.username || agentData.name || 'AGT')
        .replace(/[^a-zA-Z]/g, '')
        .toUpperCase()
        .slice(0, 4);
      const suffix = Math.floor(1000 + Math.random() * 9000);
      const autoCode = `${prefix}${suffix}`;
      promoCodes = [autoCode];
    }

    const newAgent = {
      id,
      sales: 0,
      totalSalesAmount: 0,
      subAgents: 0,
      joinDate: getLocalDateString(),
      status: 'نشط',
      promoCodes,
      parentId: null,
      ...agentData,
      password: hashedPassword,
      promoCodes, // override with generated ones
      id,
    };

    await setDoc(doc(db, COL.AGENTS, id), newAgent);

    // Register promo code(s) in PROMO_CODES collection so they work at checkout
    // Use the code itself as the document ID so validatePromoCode can find it directly
    for (const code of promoCodes) {
      const upperCode = code.toUpperCase();
      const promoData = {
        code: upperCode,
        type: 'agent',
        agentId: id,
        agentName: agentData.name || '',
        discountValue: Number(agentData.commissionRate || agentData.promoDiscount) || 10,
        discountType: 'percentage',
        maxUses: 9999,
        usedCount: 0,
        isActive: true,  // ✅ correct field name for validatePromoCode
        createdAt: new Date().toISOString(),
      };
      // Save with code as doc ID (for direct lookup in validatePromoCode)
      await setDoc(doc(db, COL.PROMO_CODES, upperCode), promoData);
      // Also save with legacy ID format for backwards compatibility
      await setDoc(doc(db, COL.PROMO_CODES, `agent_${id}_${upperCode}`), promoData);
    }

    // If agent has parent, increment parent subAgents count
    if (newAgent.parentId) {
      const parentRef = doc(db, COL.AGENTS, String(newAgent.parentId));
      const parentSnap = await getDoc(parentRef);
      if (parentSnap.exists()) {
        await safeUpdateDoc(parentRef, { subAgents: increment(1) });
      }
    }

    return newAgent;
  } catch (e) {
    console.error('Error adding agent:', e);
    return false;
  }
}


export async function updateAgent(id, agentData) {
  try {
    await safeUpdateDoc(doc(db, COL.AGENTS, String(id)), agentData);
    return true;
  } catch (e) {
    console.error('Error updating agent:', e);
    return false;
  }
}

export async function deleteAgent(id) {
  try {
    await deleteDoc(doc(db, COL.AGENTS, String(id)));
    return true;
  } catch (e) {
    console.error('Error deleting agent:', e);
    return false;
  }
}

// ==========================================
// BOOKINGS CRUD
// ==========================================

export async function getBookings() {
  try {
    // Fetch without orderBy to avoid Firestore composite index requirement
    const snapshot = await getDocs(collection(db, COL.BOOKINGS));
    const bookings = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    // Sort in memory: newest first by createdAt, then by date
    return bookings.sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt) : new Date(a.date || 0);
      const db_ = b.createdAt ? new Date(b.createdAt) : new Date(b.date || 0);
      return db_ - da;
    });
  } catch (e) {
    console.error('Error fetching bookings:', e);
    return [];
  }
}

export async function saveBookings(bookings) {
  try {
    const batch = safeWriteBatch(db);
    const existing = await getDocs(collection(db, COL.BOOKINGS));
    existing.docs.forEach(d => batch.delete(d.ref));
    bookings.forEach(booking => {
      batch.set(doc(db, COL.BOOKINGS, booking.id), booking);
    });
    await batch.commit();
    return true;
  } catch (e) {
    console.error('Error saving bookings:', e);
    return false;
  }
}

export async function addBooking(bookingData) {
  try {
    const nextId = bookingData.id || `BK-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 10)}`;
    const newBooking = {
      date: getLocalDateString(),
      status: 'مؤكد',
      ...bookingData,
      id: nextId,
    };

    // If promoCode is present but agentId is missing, resolve agent
    if (newBooking.promoCode && !newBooking.agentId) {
      const val = await validatePromoCode(newBooking.promoCode);
      if (val && val.isValid && val.agentId) {
        newBooking.agentId = val.agentId;
        if (!newBooking.agentName || newBooking.agentName === 'مباشر (بدون وكيل)' || newBooking.agentName === 'directAgent') {
          newBooking.agentName = val.agentName;
        }
      }
    }

    await setDoc(doc(db, COL.BOOKINGS, nextId), newBooking);

    // Update agent sales
    if (newBooking.agentId) {
      const agentRef = doc(db, COL.AGENTS, String(newBooking.agentId));
      const agentSnap = await safeGetDoc(agentRef);
      if (agentSnap && agentSnap.exists()) {
        await safeUpdateDoc(agentRef, { sales: increment(newBooking.finalAmount || 0) });
      }
    }

    // Record promo code use
    if (newBooking.promoCode) {
      await consumePromoCode(newBooking.promoCode);
    }

    return newBooking;
  } catch (e) {
    console.error('Error adding booking:', e);
    return false;
  }
}

export async function updateBookingStatus(id, newStatus) {
  try {
    // 1) Try direct document path lookup first
    let bookingRef = doc(db, COL.BOOKINGS, id);
    let bookingSnap = await safeGetDoc(bookingRef);

    // 2) If not found by path, query by data field 'id' (handles legacy bookings)
    if (!bookingSnap.exists()) {
      const q = query(collection(db, COL.BOOKINGS), where('id', '==', id), limit(1));
      const snapshot = await safeGetDocs(q);
      if (snapshot.empty) {
        console.error('updateBookingStatus: booking not found for id:', id);
        return false;
      }
      bookingRef = snapshot.docs[0].ref;
      bookingSnap = snapshot.docs[0];
    }

    const oldBooking = bookingSnap.data();
    const oldStatus = oldBooking.status;

    await safeUpdateDoc(bookingRef, { status: newStatus });

    // Handle agent sales adjustment on cancel/restore
    if (newStatus === 'ملغي' && oldStatus !== 'ملغي' && oldStatus !== 'فاشل' && oldBooking.agentId) {
      const agentRef = doc(db, COL.AGENTS, String(oldBooking.agentId));
      await safeUpdateDoc(agentRef, { sales: increment(-(oldBooking.finalAmount || 0)) });
    } else if (oldStatus === 'ملغي' && newStatus !== 'ملغي' && newStatus !== 'فاشل' && oldBooking.agentId) {
      const agentRef = doc(db, COL.AGENTS, String(oldBooking.agentId));
      await safeUpdateDoc(agentRef, { sales: increment(oldBooking.finalAmount || 0) });
    }

    return true;
  } catch (e) {
    console.error('Error updating booking status:', e);
    return false;
  }
}

export async function deleteBooking(id) {
  try {
    await deleteDoc(doc(db, COL.BOOKINGS, id));
    return true;
  } catch (e) {
    console.error('Error deleting booking:', e);
    return false;
  }
}

// ==========================================
// PROMO CODES CRUD
// ==========================================

export async function getPromoCodes() {
  try {
    const snapshot = await getDocs(collection(db, COL.PROMO_CODES));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('Error loading promo codes:', e);
    return DEFAULT_PROMO_CODES;
  }
}

export async function savePromoCodes(codes) {
  try {
    const batch = safeWriteBatch(db);
    const existing = await getDocs(collection(db, COL.PROMO_CODES));
    existing.docs.forEach(d => batch.delete(d.ref));
    codes.forEach(code => {
      batch.set(doc(db, COL.PROMO_CODES, code.code), code);
    });
    await batch.commit();
    return true;
  } catch (e) {
    console.error('Error saving promo codes:', e);
    return false;
  }
}

export async function addPromoCode(codeData) {
  try {
    const cleanCode = codeData.code.trim().toUpperCase();

    // Check if code already exists
    const existingSnap = await getDoc(doc(db, COL.PROMO_CODES, cleanCode));
    if (existingSnap.exists()) {
      return { error: 'كود الخصم هذا موجود بالفعل!' };
    }

    const newCode = {
      code: cleanCode,
      usedCount: 0,
      isActive: true,
      createdAt: getLocalDateString(),
      ...codeData,
      code: cleanCode,
    };

    await setDoc(doc(db, COL.PROMO_CODES, cleanCode), newCode);

    // Update agent promoCodes array
    if (newCode.agentId) {
      const agentRef = doc(db, COL.AGENTS, String(newCode.agentId));
      const agentSnap = await getDoc(agentRef);
      if (agentSnap.exists()) {
        const agentData = agentSnap.data();
        const currentCodes = agentData.promoCodes || [];
        if (!currentCodes.includes(cleanCode)) {
          await updateDoc(agentRef, { promoCodes: [...currentCodes, cleanCode] });
        }
      }
    }

    return newCode;
  } catch (e) {
    console.error('Error adding promo code:', e);
    return false;
  }
}

export async function deletePromoCode(code) {
  try {
    const codeRef = doc(db, COL.PROMO_CODES, code);
    const codeSnap = await getDoc(codeRef);
    if (!codeSnap.exists()) return false;

    const deletedCode = codeSnap.data();
    await deleteDoc(codeRef);

    // Remove from agent promoCodes array
    if (deletedCode.agentId) {
      const agentRef = doc(db, COL.AGENTS, String(deletedCode.agentId));
      const agentSnap = await getDoc(agentRef);
      if (agentSnap.exists()) {
        const agentData = agentSnap.data();
        await updateDoc(agentRef, {
          promoCodes: (agentData.promoCodes || []).filter(c => c !== code)
        });
      }
    }

    return true;
  } catch (e) {
    console.error('Error deleting promo code:', e);
    return false;
  }
}

export async function validatePromoCode(codeStr) {
  if (!codeStr) return { isValid: false, reason: 'الرجاء إدخال كود الخصم' };

  try {
    const cleanCode = codeStr.trim().toUpperCase();

    // 1. Check in PROMO_CODES collection by direct doc ID (code itself)
    const codeSnap = await safeGetDoc(doc(db, COL.PROMO_CODES, cleanCode));
    if (codeSnap && codeSnap.exists()) {
      const promo = codeSnap.data();

      // Handle both isActive (new) and active (legacy) field names
      const isActive = promo.isActive !== undefined ? promo.isActive : (promo.active !== undefined ? promo.active : true);
      if (isActive === false) {
        return { isValid: false, reason: 'كود الخصم غير نشط حالياً!' };
      }
      if (promo.maxUses && promo.usedCount >= promo.maxUses) {
        return { isValid: false, reason: 'عذراً، انتهت صلاحية استخدام هذا الكود لتجاوز الحد الأقصى!' };
      }
      if (promo.expiryDate && getLocalDateString() > promo.expiryDate) {
        return { isValid: false, reason: 'عذراً، هذا الكود منتهي الصلاحية!' };
      }

      let agentName = 'مباشر (بدون وكيل)';
      if (promo.agentId) {
        const agent = await getAgentById(promo.agentId);
        if (agent) {
          if (agent.status === 'موقوف' || agent.status === 'مرفوض') {
            return { isValid: false, reason: 'كود الخصم هذا تابع لوكيل غير نشط حالياً!' };
          }
          agentName = agent.name;
        }
      }

      return {
        isValid: true,
        code: promo.code || cleanCode,
        agentId: promo.agentId || null,
        agentName,
        discountType: promo.discountType || 'percentage',
        // Handle both discountValue (new) and discount (legacy) field names
        discountValue: Number(promo.discountValue || promo.discount) || 10
      };
    }

    // 1b. Scan PROMO_CODES collection by code field value (handles legacy agent_id_code doc IDs)
    const allPromoSnap = await safeGetDocs(collection(db, COL.PROMO_CODES));
    if (allPromoSnap && !allPromoSnap.empty) {
      const matchedPromoDoc = allPromoSnap.docs.find(d => {
        const data = d.data();
        return String(data.code || '').toUpperCase() === cleanCode;
      });
      if (matchedPromoDoc) {
        const promo = matchedPromoDoc.data();
        const isActive = promo.isActive !== undefined ? promo.isActive : (promo.active !== undefined ? promo.active : true);
        if (isActive === false) return { isValid: false, reason: 'كود الخصم غير نشط حالياً!' };
        if (promo.maxUses && promo.usedCount >= promo.maxUses) return { isValid: false, reason: 'عذراً، انتهت صلاحية استخدام هذا الكود!' };
        if (promo.expiryDate && getLocalDateString() > promo.expiryDate) return { isValid: false, reason: 'عذراً، هذا الكود منتهي الصلاحية!' };

        let agentName = 'مباشر (بدون وكيل)';
        if (promo.agentId) {
          const agent = await getAgentById(promo.agentId);
          if (agent) {
            if (agent.status === 'موقوف' || agent.status === 'مرفوض') return { isValid: false, reason: 'كود الخصم هذا تابع لوكيل غير نشط!' };
            agentName = agent.name;
          }
        }
        return {
          isValid: true,
          code: promo.code || cleanCode,
          agentId: promo.agentId || null,
          agentName,
          discountType: promo.discountType || 'percentage',
          discountValue: Number(promo.discountValue || promo.discount) || 10
        };
      }
    }

    // 2. Fallback: Search in AGENTS collection by promoCodes array or username or code
    const agents = await getAgents();
    const matchingAgent = (agents || []).find(a => {
      const codes = (a.promoCodes || []).map(c => String(c).trim().toUpperCase());
      const usernameMatch = a.username && String(a.username).trim().toUpperCase() === cleanCode;
      const codeMatch = a.code && String(a.code).trim().toUpperCase() === cleanCode;
      const idMatch = String(a.id) === cleanCode;
      return codes.includes(cleanCode) || usernameMatch || codeMatch || idMatch;
    });

    if (matchingAgent) {
      if (matchingAgent.status === 'موقوف' || matchingAgent.status === 'مرفوض') {
        return { isValid: false, reason: 'كود الخصم هذا تابع لوكيل غير نشط حالياً!' };
      }

      // Auto-create document in PROMO_CODES so future lookups are instant
      try {
        await setDoc(doc(db, COL.PROMO_CODES, cleanCode), {
          code: cleanCode,
          agentId: matchingAgent.id,
          discountType: 'percentage',
          discountValue: Number(matchingAgent.promoDiscount) || 10,
          usedCount: 0,
          isActive: true,
          createdAt: getLocalDateString(),
        });
      } catch (_) {}

      return {
        isValid: true,
        code: cleanCode,
        agentId: matchingAgent.id,
        agentName: matchingAgent.name,
        discountType: 'percentage',
        discountValue: Number(matchingAgent.promoDiscount) || 10
      };
    }

    return { isValid: false, reason: 'كود الخصم غير صحيح!' };
  } catch (e) {
    console.error('Error validating promo code:', e);
    return { isValid: false, reason: 'حدث خطأ في التحقق من الكود' };
  }
}

export async function consumePromoCode(codeStr) {
  try {
    if (!codeStr) return false;
    const cleanCode = codeStr.trim().toUpperCase();
    const codeRef = doc(db, COL.PROMO_CODES, cleanCode);
    const codeSnap = await safeGetDoc(codeRef);
    if (codeSnap && codeSnap.exists()) {
      await updateDoc(codeRef, { usedCount: increment(1) });
    }
    return true;
  } catch (e) {
    console.error('Error using promo code:', e);
    return false;
  }
}

// ==========================================
// REVIEWS CRUD
// ==========================================

export async function getReviews() {
  try {
    const q = query(collection(db, COL.REVIEWS), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    // Silently fallback
    return DEFAULT_REVIEWS;
  }
}

export async function addReview(reviewData) {
  try {
    const id = `rev-${Date.now()}`;
    const newReview = {
      id,
      date: getLocalDateString(),
      image: null,
      ...reviewData,
    };
    await setDoc(doc(db, COL.REVIEWS, id), newReview);
    return newReview;
  } catch (e) {
    console.error('Error adding review:', e);
    return false;
  }
}

export async function deleteReview(id) {
  try {
    await safeDeleteDoc(doc(db, COL.REVIEWS, id));
    return true;
  } catch (e) {
    console.error('Error deleting review:', e);
    return false;
  }
}

// ==========================================
// SOCIAL MEDIA & SETTINGS
// ==========================================

export async function getSocialMedia() {
  try {
    const snap = await safeGetDoc(doc(db, COL.SOCIAL, 'main'));
    return snap.exists() ? snap.data() : DEFAULT_SOCIAL;
  } catch (e) {
    // Silently fallback
    return DEFAULT_SOCIAL;
  }
}

export async function saveSocialMedia(socialData) {
  try {
    await safeSetDoc(doc(db, COL.SOCIAL, 'main'), socialData, { merge: true });
    return true;
  } catch (e) {
    console.error('Error saving social media:', e);
    return false;
  }
}

export async function getSettings() {
  try {
    const snap = await getDoc(doc(db, COL.SETTINGS, 'main'));
    return snap.exists() ? snap.data() : DEFAULT_SETTINGS;
  } catch (e) {
    console.error('Error loading settings:', e);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settingsData) {
  try {
    // Reset circuit breaker for save operations
    _circuitBreaker.tripped = false;
    _circuitBreaker.trippedAt = null;
    _circuitBreaker.errorLogged = false;

    console.log('Saving settings to Firebase:', Object.keys(settingsData));
    await safeSetDoc(doc(db, COL.SETTINGS, 'main'), settingsData, { merge: true });
    console.log('Settings saved successfully');
    return true;
  } catch (e) {
    console.error('Error saving settings:', e);
    // Reset circuit breaker on error to allow retry
    _circuitBreaker.tripped = false;
    _circuitBreaker.trippedAt = null;
    _circuitBreaker.errorLogged = false;
    return false;
  }
}

// ==========================================
// REAL-TIME LISTENERS (for live updates)
// ==========================================

export function subscribeToBookings(callback) {
  const q = query(collection(db, COL.BOOKINGS), orderBy('date', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const bookings = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(bookings);
  });
}

export function subscribeToReviews(callback) {
  const q = query(collection(db, COL.REVIEWS), orderBy('date', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const reviews = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(reviews);
  });
}

export function subscribeToAgents(callback) {
  return onSnapshot(collection(db, COL.AGENTS), (snapshot) => {
    const agents = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(agents);
  });
}

// تحقق من إعداد Firebase
export const isFirebaseConfigured = () => {
  return !!db;
};

// تفريغ كامل النظام (للاستخدام من قبل المسؤول فقط)
export async function clearAllData() {
  if (!db) return { success: false, error: 'Firebase not configured' };
  
  try {
    const collections = [COL.BOOKINGS, COL.AGENTS, COL.PROMO_CODES, COL.REVIEWS, COL.SOCIAL, COL.SETTINGS];
    
    for (const colName of collections) {
      const colRef = collection(db, colName);
      const snapshot = await getDocs(colRef);
      
      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      if (snapshot.size > 0) {
        await batch.commit();
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error clearing all data:', error);
    return { success: false, error: error.message };
  }
}

// تصدير جميع الدوال
export {
  getTrips,
  getAllTrips,
  addTrip,
  updateTrip,
  deleteTrip,
  getPackages,
  addPackage,
  updatePackage,
  deletePackage,
  getAgents,
  saveAgents,
  getAgentById,
  getAgentByUsername,
  addAgent,
  updateAgent,
  deleteAgent,
  getBookings,
  saveBookings,
  addBooking,
  updateBookingStatus,
  deleteBooking,
  getPromoCodes,
  savePromoCodes,
  addPromoCode,
  deletePromoCode,
  validatePromoCode,
  consumePromoCode,
  getReviews,
  addReview,
  deleteReview,
  getSocialMedia,
  saveSocialMedia,
  getSettings,
  saveSettings,
  clearAllData,
  subscribeToBookings,
  subscribeToReviews,
  subscribeToAgents,
  isFirebaseConfigured,
};
