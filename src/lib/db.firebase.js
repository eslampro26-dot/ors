
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

// Timeout helper for Firebase Firestore operations
async function withTimeout(promise, timeoutMs = 25000) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Firebase operation timed out')), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
  }
}

// Intercepted safe functions with timeout circuit breakers
const safeGetDoc = (ref) => withTimeout(getDoc(ref));
const safeGetDocs = (q) => withTimeout(getDocs(q));
const safeSetDoc = (ref, data, options) => withTimeout(setDoc(ref, data, options));
const safeAddDoc = (collRef, data) => withTimeout(addDoc(collRef, data));
const safeUpdateDoc = (ref, data) => withTimeout(updateDoc(ref, data));
const safeDeleteDoc = (ref) => withTimeout(deleteDoc(ref));
const safeWriteBatch = (firestoreDb) => {
  const batch = writeBatch(firestoreDb);
  const originalCommit = batch.commit.bind(batch);
  batch.commit = () => withTimeout(originalCommit());
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
// TRIPS CRUD
// ==========================================

export async function getTrips(slug, category) {
  const staticTrips = (sampleTrips[slug] && sampleTrips[slug][category]) || [];
  // Circuit breaker: skip Firebase if previously failed
  if (_circuitBreaker.isOpen()) return staticTrips;
  try {
    const q = query(collection(db, COL.TRIPS), where('slug', '==', slug), where('category', '==', category));
    const snapshot = await withTimeout(getDocs(q), 5000);
    const customTrips = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return [...staticTrips, ...customTrips];
  } catch (e) {
    _circuitBreaker.trip(e);
    return staticTrips;
  }
}

export async function getAllTrips() {
  // Circuit breaker: skip Firebase if previously failed
  if (_circuitBreaker.isOpen()) return [];
  try {
    const snapshot = await withTimeout(getDocs(collection(db, COL.TRIPS)), 10000);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    _circuitBreaker.trip(e);
    return [];
  }
}

export async function addTrip(slug, category, tripData) {
  try {
    const newTrip = {
      slug,
      category,
      currency: 'EUR',
      rating: 5.0,
      reviews: 1,
      image: tripData.image || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
      createdAt: new Date().toISOString(),
      ...tripData,
    };
    const docRef = await safeAddDoc(collection(db, COL.TRIPS), newTrip);
    return { id: docRef.id, ...newTrip };
  } catch (e) {
    console.error('Error saving trip to Firebase:', e);
    return false;
  }
}

export async function updateTrip(tripId, tripData) {
  try {
    // استخدام Document ID مباشرة — الحقل 'id' لا يُحفظ داخل الوثيقة
    const tripRef = doc(db, COL.TRIPS, String(tripId));
    const tripSnap = await safeGetDoc(tripRef);
    if (tripSnap.exists()) {
      await safeUpdateDoc(tripRef, tripData);
      return true;
    }
    // fallback: بحث عبر query على حقل id (للرحلات القديمة التي تحتوي على الحقل)
    const q = query(collection(db, COL.TRIPS), where('id', '==', tripId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      await safeUpdateDoc(doc(db, COL.TRIPS, snapshot.docs[0].id), tripData);
      return true;
    }
    return false;
  } catch (e) {
    console.error('Error updating trip:', e);
    return false;
  }
}

export async function deleteTrip(slug, category, tripId) {
  try {
    // البحث عن الرحلة باستخدام slug و category
    const q = query(collection(db, COL.TRIPS), where('slug', '==', slug), where('category', '==', category));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      // حذف أول تطابق
      await safeDeleteDoc(doc(db, COL.TRIPS, snapshot.docs[0].id));
      return true;
    }
    
    return false;
  } catch (e) {
    console.error('Error deleting trip:', e);
    return false;
  }
}

// ==========================================
// PACKAGES CRUD
// ==========================================

export async function getPackages(pkgId) {
  // Circuit breaker: skip Firebase if previously failed
  if (_circuitBreaker.isOpen()) return [];
  try {
    const q = query(collection(db, COL.PACKAGES), where('pkgId', '==', pkgId));
    const snapshot = await withTimeout(getDocs(q), 5000);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    _circuitBreaker.trip(e);
    return [];
  }
}

export async function addPackage(pkgId, packageData) {
  try {
    const newPackage = {
      pkgId,
      currency: 'EUR',
      rating: 5.0,
      reviews: 1,
      icon: packageData.icon || 'plane',
      createdAt: new Date().toISOString(),
      ...packageData,
    };
    const docRef = await safeAddDoc(collection(db, COL.PACKAGES), newPackage);
    return { id: docRef.id, ...newPackage };
  } catch (e) {
    console.error('Error saving package to Firebase:', e);
    return false;
  }
}

export async function updatePackage(pkgId, packageId, packageData) {
  try {
    // البحث عن الباقة باستخدام packageId
    const q = query(collection(db, COL.PACKAGES), where('id', '==', packageId));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      // تحديث أول تطابق
      await safeUpdateDoc(doc(db, COL.PACKAGES, snapshot.docs[0].id), packageData);
      return true;
    }
    
    return false;
  } catch (e) {
    console.error('Error updating package:', e);
    return false;
  }
}

export async function deletePackage(pkgId, packageId) {
  try {
    // البحث عن الباقة باستخدام pkgId
    const q = query(collection(db, COL.PACKAGES), where('pkgId', '==', pkgId));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      // حذف أول تطابق
      await safeDeleteDoc(doc(db, COL.PACKAGES, snapshot.docs[0].id));
      return true;
    }
    
    return false;
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

export async function getAgentById(id) {
  try {
    const snap = await getDoc(doc(db, COL.AGENTS, String(id)));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (e) {
    console.error('Error getting agent by ID:', e);
    return null;
  }
}

export async function getAgentByUsername(username) {
  try {
    const q = query(collection(db, COL.AGENTS), where('username', '==', username.toLowerCase()), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const d = snapshot.docs[0];
    return { id: d.id, ...d.data() };
  } catch (e) {
    console.error('Error getting agent by username:', e);
    return null;
  }
}

export async function addAgent(agentData) {
  try {
    const snapshot = await getDocs(collection(db, COL.AGENTS));
    const agents = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    const nextId = agents.length > 0 ? Math.max(...agents.map(a => parseInt(a.id, 10) || 0)) + 1 : 1;
    const id = String(nextId);

    // Hash password if not already hashed (C-2, C-5)
    let hashedPassword = agentData.password;
    if (hashedPassword && !hashedPassword.startsWith('$2a$') && !hashedPassword.startsWith('$2b$')) {
      const bcrypt = require('bcryptjs');
      const salt = bcrypt.genSaltSync(10);
      hashedPassword = bcrypt.hashSync(hashedPassword, salt);
    }

    const newAgent = {
      id,
      sales: 0,
      subAgents: 0,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'نشط',
      promoCodes: [],
      parentId: null,
      ...agentData,
      password: hashedPassword,
      id,
    };

    await setDoc(doc(db, COL.AGENTS, id), newAgent);

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
    const q = query(collection(db, COL.BOOKINGS), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    // Silently fallback to LS on timeout
    return DEFAULT_BOOKINGS;
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
    const nextId = `BK-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 10)}`;
    const newBooking = {
      id: nextId,
      date: new Date().toISOString().split('T')[0],
      status: 'مؤكد',
      ...bookingData,
    };

    await setDoc(doc(db, COL.BOOKINGS, nextId), newBooking);

    // Update agent sales
    if (newBooking.agentId) {
      const agentRef = doc(db, COL.AGENTS, String(newBooking.agentId));
      const agentSnap = await getDoc(agentRef);
      if (agentSnap.exists()) {
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
    const bookingRef = doc(db, COL.BOOKINGS, id);
    const bookingSnap = await getDoc(bookingRef);
    if (!bookingSnap.exists()) return false;

    const oldBooking = bookingSnap.data();
    const oldStatus = oldBooking.status;

    await safeUpdateDoc(bookingRef, { status: newStatus });

    // Handle agent sales adjustment on cancel/restore
    if (newStatus === 'ملغي' && oldStatus !== 'ملغي' && oldStatus !== 'فاشل' && oldBooking.agentId) {
      const agentRef = doc(db, COL.AGENTS, String(oldBooking.agentId));
      await safeUpdateDoc(agentRef, { sales: increment(-(oldBooking.finalAmount || 0)) });
    } else if (oldStatus === 'ملغي' && newStatus !== 'ملغي' && newStatus !== 'فاشل' && oldBooking.agentId) {
      const agentRef = doc(db, COL.AGENTS, String(oldBooking.agentId));
      await updateDoc(agentRef, { sales: increment(oldBooking.finalAmount || 0) });
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
      createdAt: new Date().toISOString().split('T')[0],
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
    const codeSnap = await getDoc(doc(db, COL.PROMO_CODES, codeStr.trim().toUpperCase()));
    if (!codeSnap.exists()) {
      return { isValid: false, reason: 'كود الخصم غير صحيح!' };
    }

    const promo = codeSnap.data();

    if (!promo.isActive) {
      return { isValid: false, reason: 'كود الخصم غير نشط حالياً!' };
    }

    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      return { isValid: false, reason: 'عذراً، انتهت صلاحية استخدام هذا الكود لتجاوز الحد الأقصى!' };
    }

    if (promo.expiryDate) {
      const today = new Date().toISOString().split('T')[0];
      if (today > promo.expiryDate) {
        return { isValid: false, reason: 'عذراً، هذا الكود منتهي الصلاحية!' };
      }
    }

    let agentName = 'مباشر (بدون وكيل)';
    if (promo.agentId) {
      const agent = await getAgentById(promo.agentId);
      if (agent) {
        if (agent.status !== 'نشط') {
          return { isValid: false, reason: 'كود الخصم هذا تابع لوكيل موقوف حالياً!' };
        }
        agentName = agent.name;
      }
    }

    return {
      isValid: true,
      code: promo.code,
      agentId: promo.agentId,
      agentName,
      discountType: promo.discountType,
      discountValue: promo.discountValue
    };
  } catch (e) {
    console.error('Error validating promo code:', e);
    return { isValid: false, reason: 'حدث خطأ في التحقق من الكود' };
  }
}

export async function consumePromoCode(codeStr) {
  try {
    const codeRef = doc(db, COL.PROMO_CODES, codeStr.trim().toUpperCase());
    await updateDoc(codeRef, { usedCount: increment(1) });
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
      date: new Date().toISOString().split('T')[0],
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
    await safeSetDoc(doc(db, COL.SETTINGS, 'main'), settingsData, { merge: true });
    return true;
  } catch (e) {
    console.error('Error saving settings:', e);
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
  initializeDB,
  subscribeToBookings,
  subscribeToReviews,
  subscribeToAgents,
  DEFAULT_AGENTS,
  DEFAULT_BOOKINGS,
  DEFAULT_PROMO_CODES,
  DEFAULT_REVIEWS,
  DEFAULT_SOCIAL,
  DEFAULT_SETTINGS
};
