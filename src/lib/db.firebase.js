
'use client';

// Firebase Firestore persistence layer - replaces localStorage
import { db } from './firebase';
import { 
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, onSnapshot, writeBatch, increment
} from 'firebase/firestore';
import { sampleTrips } from './data';

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
};

export async function initializeDB() {
  try {
    // Check if already seeded
    const metaDoc = await getDoc(doc(db, '_meta', 'initialized'));
    if (metaDoc.exists()) return;

    const batch = writeBatch(db);

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
    batch.set(doc(db, '_meta', 'initialized'), { seededAt: new Date().toISOString() });

    await batch.commit();
    console.log('Firebase DB seeded successfully');
  } catch (e) {
    console.error('Error seeding Firebase DB:', e);
  }
}

// ==========================================
// TRIPS CRUD
// ==========================================

export async function getTrips(slug, category) {
  const staticTrips = (sampleTrips[slug] && sampleTrips[slug][category]) || [];
  try {
    const q = query(collection(db, COL.TRIPS), where('slug', '==', slug), where('category', '==', category));
    const snapshot = await getDocs(q);
    const customTrips = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return [...staticTrips, ...customTrips];
  } catch (e) {
    console.error('Error loading trips from Firebase:', e);
    return staticTrips;
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
      image: tripData.image || '/images/trips/glass-boat.jpg',
      createdAt: new Date().toISOString(),
      ...tripData,
    };
    const docRef = await addDoc(collection(db, COL.TRIPS), newTrip);
    return { id: docRef.id, ...newTrip };
  } catch (e) {
    console.error('Error saving trip to Firebase:', e);
    return false;
  }
}

export async function updateTrip(tripId, tripData) {
  try {
    await updateDoc(doc(db, COL.TRIPS, tripId), tripData);
    return true;
  } catch (e) {
    console.error('Error updating trip:', e);
    return false;
  }
}

export async function deleteTrip(tripId) {
  try {
    await deleteDoc(doc(db, COL.TRIPS, tripId));
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
    const q = query(collection(db, COL.PACKAGES), where('pkgId', '==', pkgId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('Error loading packages from Firebase:', e);
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
    const docRef = await addDoc(collection(db, COL.PACKAGES), newPackage);
    return { id: docRef.id, ...newPackage };
  } catch (e) {
    console.error('Error saving package to Firebase:', e);
    return false;
  }
}

export async function updatePackage(packageId, packageData) {
  try {
    await updateDoc(doc(db, COL.PACKAGES, packageId), packageData);
    return true;
  } catch (e) {
    console.error('Error updating package:', e);
    return false;
  }
}

export async function deletePackage(packageId) {
  try {
    await deleteDoc(doc(db, COL.PACKAGES, packageId));
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
    console.error('Error loading agents:', e);
    return DEFAULT_AGENTS;
  }
}

export async function saveAgents(agents) {
  try {
    const batch = writeBatch(db);
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
        await updateDoc(parentRef, { subAgents: increment(1) });
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
    await updateDoc(doc(db, COL.AGENTS, String(id)), agentData);
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
    console.error('Error loading bookings:', e);
    return DEFAULT_BOOKINGS;
  }
}

export async function saveBookings(bookings) {
  try {
    const batch = writeBatch(db);
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
        await updateDoc(agentRef, { sales: increment(newBooking.finalAmount || 0) });
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

    await updateDoc(bookingRef, { status: newStatus });

    // Handle agent sales adjustment on cancel/restore
    if (newStatus === 'ملغي' && oldStatus !== 'ملغي' && oldStatus !== 'فاشل' && oldBooking.agentId) {
      const agentRef = doc(db, COL.AGENTS, String(oldBooking.agentId));
      await updateDoc(agentRef, { sales: increment(-(oldBooking.finalAmount || 0)) });
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
    const batch = writeBatch(db);
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
    console.error('Error loading reviews:', e);
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
    await deleteDoc(doc(db, COL.REVIEWS, id));
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
    const snap = await getDoc(doc(db, COL.SOCIAL, 'main'));
    return snap.exists() ? snap.data() : DEFAULT_SOCIAL;
  } catch (e) {
    console.error('Error loading social media:', e);
    return DEFAULT_SOCIAL;
  }
}

export async function saveSocialMedia(socialData) {
  try {
    await setDoc(doc(db, COL.SOCIAL, 'main'), socialData, { merge: true });
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
    await setDoc(doc(db, COL.SETTINGS, 'main'), settingsData, { merge: true });
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
