
// Database Adapter - Firebase with localStorage fallback
// This module provides a unified API that tries Firebase first,
// and falls back to localStorage if Firebase is not configured.

import { 
  getTrips as fbGetTrips, addTrip as fbAddTrip, updateTrip as fbUpdateTrip, deleteTrip as fbDeleteTrip,
  getPackages as fbGetPackages, addPackage as fbAddPackage,
  getAgents as fbGetAgents, addAgent as fbAddAgent, updateAgent as fbUpdateAgent, deleteAgent as fbDeleteAgent, saveAgents as fbSaveAgents,
  getAgentById as fbGetAgentById, getAgentByUsername as fbGetAgentByUsername,
  getBookings as fbGetBookings, addBooking as fbAddBooking, updateBookingStatus as fbUpdateBookingStatus, saveBookings as fbSaveBookings,
  getPromoCodes as fbGetPromoCodes, addPromoCode as fbAddPromoCode, deletePromoCode as fbDeletePromoCode,
  validatePromoCode as fbValidatePromoCode, consumePromoCode as fbConsumePromoCode,
  getReviews as fbGetReviews, addReview as fbAddReview,
  getSocialMedia as fbGetSocialMedia, saveSocialMedia as fbSaveSocialMedia,
  getSettings as fbGetSettings, saveSettings as fbSaveSettings,
  initializeDB as fbInitializeDB,
} from './db.firebase';

// Check if Firebase is configured
const isFirebaseConfigured = () => {
  return process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && 
         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== 'orluxus-demo';
};

// ==========================================
// LOCAL STORAGE FALLBACK (original db.js logic)
// ==========================================
const isClient = typeof window !== 'undefined';

import { sampleTrips } from './data';

const DEFAULT_AGENTS = [
  { id: 1, name: 'أحمد محمود', email: 'ahmed@example.com', username: 'ahmed', password: 'Agent@2026!Sec', tier: 'silver', sales: 105000, subAgents: 3, joinDate: '2026-01-10', status: 'نشط', parentId: 5, promoCodes: ['AHMED10'] },
  { id: 2, name: 'سارة إبراهيم', email: 'sara@example.com', username: 'sara', password: 'Agent@2026!Sec', tier: 'gold', sales: 98500, subAgents: 0, joinDate: '2025-11-20', status: 'نشط', parentId: 5, promoCodes: ['SARA20'] },
  { id: 3, name: 'خالد عبد الرحمن', email: 'khaled@example.com', username: 'khaled', password: 'Agent@2026!Sec', tier: 'silver', sales: 85200, subAgents: 0, joinDate: '2026-02-05', status: 'نشط', parentId: 5, promoCodes: ['KHALED15'] },
  { id: 4, name: 'منى جمال', email: 'mona@example.com', username: 'mona', password: 'Agent@2026!Sec', tier: 'bronze', sales: 75000, subAgents: 0, joinDate: '2026-03-15', status: 'موقوف', parentId: 1, promoCodes: ['MONA5'] },
  { id: 5, name: 'طارق زياد', email: 'tarek@example.com', username: 'tarek', password: 'Agent@2026!Sec', tier: 'platinum', sales: 250000, subAgents: 4, joinDate: '2025-05-10', status: 'نشط', parentId: null, promoCodes: ['TAREK25'] },
  { id: 6, name: 'يوسف سليم', email: 'youssef@example.com', username: 'youssef', password: 'Agent@2026!Sec', tier: 'bronze', sales: 20000, subAgents: 0, joinDate: '2026-04-01', status: 'نشط', parentId: 1, promoCodes: ['YOUSSEF10'] },
  { id: 7, name: 'حازم عمر', email: 'hazem@example.com', username: 'hazem', password: 'Agent@2026!Sec', tier: 'bronze', sales: 12000, subAgents: 0, joinDate: '2026-04-10', status: 'نشط', parentId: 1, promoCodes: ['HAZEM10'] },
];

const DEFAULT_PROMO_CODES = [
  { code: 'AHMED10', agentId: 1, discountType: 'percentage', discountValue: 10, maxUses: 100, usedCount: 5, isActive: true, expiryDate: '2026-12-31', createdAt: '2026-01-10', createdBy: 'admin' },
  { code: 'SARA20', agentId: 2, discountType: 'percentage', discountValue: 20, maxUses: 50, usedCount: 12, isActive: true, expiryDate: '2026-12-31', createdAt: '2025-11-20', createdBy: 'admin' },
  { code: 'KHALED15', agentId: 3, discountType: 'percentage', discountValue: 15, maxUses: 100, usedCount: 8, isActive: true, expiryDate: '2026-12-31', createdAt: '2026-02-05', createdBy: 'admin' },
  { code: 'MONA5', agentId: 4, discountType: 'percentage', discountValue: 5, maxUses: 200, usedCount: 3, isActive: true, expiryDate: '2026-12-31', createdAt: '2026-03-15', createdBy: 'admin' },
  { code: 'TAREK25', agentId: 5, discountType: 'percentage', discountValue: 25, maxUses: 50, usedCount: 22, isActive: true, expiryDate: '2026-12-31', createdAt: '2025-05-10', createdBy: 'admin' },
  { code: 'YOUSSEF10', agentId: 6, discountType: 'percentage', discountValue: 10, maxUses: 100, usedCount: 2, isActive: true, expiryDate: '2026-12-31', createdAt: '2026-04-01', createdBy: 'admin' },
  { code: 'HAZEM10', agentId: 7, discountType: 'percentage', discountValue: 10, maxUses: 100, usedCount: 1, isActive: true, expiryDate: '2026-12-31', createdAt: '2026-04-10', createdBy: 'admin' },
];

const DEFAULT_BOOKINGS = [
  { id: 'BK-1001', date: '2026-05-21', customer: 'محمد علي', phone: '01012345678', whatsapp: '01012345678', service: 'رحلة جزيرة تيران', city: 'شرم الشيخ', agentId: 1, agentName: 'أحمد محمود', originalAmount: 70, discountAmount: 7, finalAmount: 63, travelers: 2, status: 'مؤكد', promoCode: 'AHMED10', paymentType: 'paypal', txId: 'pp-tx-1001' },
  { id: 'BK-1002', date: '2026-05-21', customer: 'سارة إبراهيم', phone: '01123456789', whatsapp: '01123456789', service: 'عشاء بدوي مع عرض', city: 'شرم الشيخ', agentId: null, agentName: 'مباشر (بدون وكيل)', originalAmount: 30, discountAmount: 0, finalAmount: 30, travelers: 1, status: 'قيد الانتظار', promoCode: '', paymentType: 'cash', txId: 'cash-tx-1002' },
  { id: 'BK-1003', date: '2026-05-20', customer: 'كريم مصطفى', phone: '01234567890', whatsapp: '01234567890', service: 'سفاري رباعي الدفع', city: 'الغردقة', agentId: 3, agentName: 'خالد عبد الرحمن', originalAmount: 80, discountAmount: 12, finalAmount: 68, travelers: 2, status: 'مكتمل', promoCode: 'KHALED15', paymentType: 'paypal', txId: 'pp-tx-1003' },
  { id: 'BK-1004', date: '2026-05-20', customer: 'منى يوسف', phone: '01512345678', whatsapp: '01512345678', service: 'رحلة جزيرة الجفتون', city: 'الغردقة', agentId: 2, agentName: 'سارة إبراهيم', originalAmount: 50, discountAmount: 10, finalAmount: 40, travelers: 2, status: 'مؤكد', promoCode: 'SARA20', paymentType: 'paypal', txId: 'pp-tx-1004' },
  { id: 'BK-1005', date: '2026-05-19', customer: 'طارق حسن', phone: '01098765432', whatsapp: '01098765432', service: 'غوص للمبتدئين', city: 'مرسى علم', agentId: 1, agentName: 'أحمد محمود', originalAmount: 50, discountAmount: 5, finalAmount: 45, travelers: 1, status: 'ملغي', promoCode: 'AHMED10', paymentType: 'cash', txId: 'cash-tx-1005' },
];

const DEFAULT_REVIEWS = [
  { id: 'rev-1', name: 'Sophie L.', country: 'France', rating: 5, text: 'Absolutely spectacular yacht trip. The family atmosphere made us feel so safe and welcomed.', date: '2026-05-20', image: null },
  { id: 'rev-2', name: 'Michael K.', country: 'Germany', rating: 5, text: 'Seamless reservation via PayPal, instant PDF invoice, and the private airport transfer was punctual.', date: '2026-05-18', image: null },
  { id: 'rev-3', name: 'Ahmed A.', country: 'Egypt', rating: 5, text: 'Best safari in Sharm El Sheikh. Outstanding organization, and very respectful staff.', date: '2026-05-15', image: null }
];

// --- Local Storage Helpers ---
function lsGet(key, fallback = null) {
  if (process.env.NODE_ENV === 'production') return fallback;
  if (!isClient) return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch { return fallback; }
}

function lsSet(key, value) {
  if (process.env.NODE_ENV === 'production') {
    console.error('LocalStorage is disabled in production.');
    return false;
  }
  if (!isClient) return false;
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { return false; }
}

// --- Local Storage CRUD ---
const ls = {
  getTrips: (slug, category) => {
    const staticTrips = (sampleTrips[slug] && sampleTrips[slug][category]) || [];
    const custom = lsGet(`trips_${slug}_${category}`, []);
    return [...staticTrips, ...custom];
  },
  addTrip: (slug, category, tripData) => {
    const existing = lsGet(`trips_${slug}_${category}`, []);
    const newTrip = { id: `custom-trip-${Date.now()}`, currency: 'EUR', rating: 5.0, reviews: 1, image: tripData.image || '/images/trips/glass-boat.jpg', ...tripData };
    lsSet(`trips_${slug}_${category}`, [...existing, newTrip]);
    return newTrip;
  },
  getPackages: (pkgId) => lsGet(`packages_${pkgId}`, []),
  addPackage: (pkgId, packageData) => {
    const existing = lsGet(`packages_${pkgId}`, []);
    const newPkg = { id: `custom-pkg-${Date.now()}`, currency: 'EUR', rating: 5.0, reviews: 1, icon: packageData.icon || 'plane', ...packageData };
    lsSet(`packages_${pkgId}`, [...existing, newPkg]);
    return newPkg;
  },
  getAgents: () => lsGet('agents_data', DEFAULT_AGENTS),
  saveAgents: (agents) => lsSet('agents_data', agents),
  getAgentById: (id) => {
    const agents = lsGet('agents_data', DEFAULT_AGENTS);
    return agents.find(a => a.id === id || a.id === parseInt(id, 10)) || null;
  },
  getAgentByUsername: (username) => {
    const agents = lsGet('agents_data', DEFAULT_AGENTS);
    return agents.find(a => a.username.toLowerCase() === username.toLowerCase()) || null;
  },
  addAgent: (agentData) => {
    const agents = lsGet('agents_data', DEFAULT_AGENTS);
    const nextId = agents.length > 0 ? Math.max(...agents.map(a => a.id)) + 1 : 1;

    // Hash password if not already hashed (C-2, C-5)
    let hashedPassword = agentData.password;
    if (hashedPassword && !hashedPassword.startsWith('$2a$') && !hashedPassword.startsWith('$2b$')) {
      try {
        const bcrypt = require('bcryptjs');
        const salt = bcrypt.genSaltSync(10);
        hashedPassword = bcrypt.hashSync(hashedPassword, salt);
      } catch (e) {
        console.error('Error hashing password in local storage adapter:', e);
      }
    }

    const newAgent = { id: nextId, sales: 0, subAgents: 0, joinDate: new Date().toISOString().split('T')[0], status: 'نشط', promoCodes: [], parentId: null, ...agentData, password: hashedPassword };
    const updated = [...agents, newAgent];
    if (newAgent.parentId) {
      const parentIdx = updated.findIndex(a => a.id === parseInt(newAgent.parentId, 10));
      if (parentIdx !== -1) updated[parentIdx].subAgents = (updated[parentIdx].subAgents || 0) + 1;
    }
    lsSet('agents_data', updated);
    return newAgent;
  },
  getBookings: () => lsGet('bookings_data', DEFAULT_BOOKINGS),
  saveBookings: (bookings) => lsSet('bookings_data', bookings),
  addBooking: (bookingData) => {
    const bookings = lsGet('bookings_data', DEFAULT_BOOKINGS);
    const nextId = `BK-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 10)}`;
    const newBooking = { id: nextId, date: new Date().toISOString().split('T')[0], status: 'مؤكد', ...bookingData };
    lsSet('bookings_data', [newBooking, ...bookings]);
    return newBooking;
  },
  updateBookingStatus: (id, newStatus) => {
    const bookings = lsGet('bookings_data', DEFAULT_BOOKINGS);
    const idx = bookings.findIndex(b => b.id === id);
    if (idx === -1) return false;
    const old = bookings[idx];
    bookings[idx] = { ...old, status: newStatus };
    lsSet('bookings_data', bookings);
    if (newStatus === 'ملغي' && old.status !== 'ملغي' && old.agentId) {
      const agents = lsGet('agents_data', DEFAULT_AGENTS);
      const aIdx = agents.findIndex(a => a.id === parseInt(old.agentId, 10));
      if (aIdx !== -1) { agents[aIdx].sales = Math.max(0, (agents[aIdx].sales || 0) - old.finalAmount); lsSet('agents_data', agents); }
    }
    return true;
  },
  getPromoCodes: () => lsGet('promo_codes', DEFAULT_PROMO_CODES),
  savePromoCodes: (codes) => lsSet('promo_codes', codes),
  addPromoCode: (codeData) => {
    const codes = lsGet('promo_codes', DEFAULT_PROMO_CODES);
    const cleanCode = codeData.code.trim().toUpperCase();
    if (codes.some(c => c.code === cleanCode)) return { error: 'كود الخصم هذا موجود بالفعل!' };
    const newCode = { code: cleanCode, usedCount: 0, isActive: true, createdAt: new Date().toISOString().split('T')[0], ...codeData, code: cleanCode };
    lsSet('promo_codes', [...codes, newCode]);
    if (newCode.agentId) {
      const agents = lsGet('agents_data', DEFAULT_AGENTS);
      const aIdx = agents.findIndex(a => a.id === parseInt(newCode.agentId, 10));
      if (aIdx !== -1) { agents[aIdx].promoCodes = [...(agents[aIdx].promoCodes || []), cleanCode]; lsSet('agents_data', agents); }
    }
    return newCode;
  },
  deletePromoCode: (code) => {
    const codes = lsGet('promo_codes', DEFAULT_PROMO_CODES);
    const deleted = codes.find(c => c.code === code);
    lsSet('promo_codes', codes.filter(c => c.code !== code));
    if (deleted && deleted.agentId) {
      const agents = lsGet('agents_data', DEFAULT_AGENTS);
      const aIdx = agents.findIndex(a => a.id === parseInt(deleted.agentId, 10));
      if (aIdx !== -1) { agents[aIdx].promoCodes = (agents[aIdx].promoCodes || []).filter(c => c !== code); lsSet('agents_data', agents); }
    }
    return true;
  },
  validatePromoCode: (codeStr) => {
    if (!codeStr) return { isValid: false, reason: 'الرجاء إدخال كود الخصم' };
    const codes = lsGet('promo_codes', DEFAULT_PROMO_CODES);
    const promo = codes.find(c => c.code.toUpperCase() === codeStr.trim().toUpperCase());
    if (!promo) return { isValid: false, reason: 'كود الخصم غير صحيح!' };
    if (!promo.isActive) return { isValid: false, reason: 'كود الخصم غير نشط حالياً!' };
    if (promo.maxUses && promo.usedCount >= promo.maxUses) return { isValid: false, reason: 'عذراً، انتهت صلاحية استخدام هذا الكود لتجاوز الحد الأقصى!' };
    if (promo.expiryDate) { const today = new Date().toISOString().split('T')[0]; if (today > promo.expiryDate) return { isValid: false, reason: 'عذراً، هذا الكود منتهي الصلاحية!' }; }
    let agentName = 'مباشر (بدون وكيل)';
    if (promo.agentId) { const agent = ls.getAgentById(promo.agentId); if (agent) { if (agent.status !== 'نشط') return { isValid: false, reason: 'كود الخصم هذا تابع لوكيل موقوف حالياً!' }; agentName = agent.name; } }
    return { isValid: true, code: promo.code, agentId: promo.agentId, agentName, discountType: promo.discountType, discountValue: promo.discountValue };
  },
  consumePromoCode: (codeStr) => {
    const codes = lsGet('promo_codes', DEFAULT_PROMO_CODES);
    const idx = codes.findIndex(c => c.code.toUpperCase() === codeStr.trim().toUpperCase());
    if (idx === -1) return false;
    codes[idx].usedCount = (codes[idx].usedCount || 0) + 1;
    lsSet('promo_codes', codes);
    return true;
  },
  getReviews: () => lsGet('site_reviews', DEFAULT_REVIEWS),
  addReview: (reviewData) => {
    const reviews = lsGet('site_reviews', DEFAULT_REVIEWS);
    const newReview = { id: `rev-${Date.now()}`, date: new Date().toISOString().split('T')[0], image: null, ...reviewData };
    lsSet('site_reviews', [newReview, ...reviews]);
    return newReview;
  },
  getSocialMedia: () => {
    if (!isClient) return { email: 'info@orluxus.com', facebook: 'https://facebook.com/orluxus', tiktok: 'https://www.tiktok.com/@orluxus?_r=1&_t=ZS-979ayAlnRlV', instagram: 'https://www.instagram.com/orluxus?igsh=N2lmbmg2eGJzNmVx' };
    return {
      email: localStorage.getItem('orluxus_email') || 'info@orluxus.com',
      facebook: localStorage.getItem('orluxus_facebook') || 'https://facebook.com/orluxus',
      tiktok: localStorage.getItem('orluxus_tiktok') || 'https://www.tiktok.com/@orluxus?_r=1&_t=ZS-979ayAlnRlV',
      instagram: localStorage.getItem('orluxus_instagram') || 'https://www.instagram.com/orluxus?igsh=N2lmbmg2eGJzNmVx'
    };
  },
  saveSocialMedia: (socialData) => {
    if (!isClient) return false;
    try {
      if (socialData.email) localStorage.setItem('orluxus_email', socialData.email);
      if (socialData.facebook) localStorage.setItem('orluxus_facebook', socialData.facebook);
      if (socialData.tiktok) localStorage.setItem('orluxus_tiktok', socialData.tiktok);
      if (socialData.instagram) localStorage.setItem('orluxus_instagram', socialData.instagram);
      return true;
    } catch { return false; }
  },
  initializeDB: () => {
    if (!isClient) return;
    if (!localStorage.getItem('agents_data')) localStorage.setItem('agents_data', JSON.stringify(DEFAULT_AGENTS));
    if (!localStorage.getItem('promo_codes')) localStorage.setItem('promo_codes', JSON.stringify(DEFAULT_PROMO_CODES));
    if (!localStorage.getItem('bookings_data')) localStorage.setItem('bookings_data', JSON.stringify(DEFAULT_BOOKINGS));
    if (!localStorage.getItem('site_reviews')) localStorage.setItem('site_reviews', JSON.stringify(DEFAULT_REVIEWS));
  },
};

// Auto-init localStorage
if (isClient) ls.initializeDB();

// ==========================================
// UNIFIED EXPORTS - Firebase first, LS fallback
// ==========================================

const useFirebase = isFirebaseConfigured();

export async function initializeDB() {
  if (useFirebase) {
    return fbInitializeDB();
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Database connection failed. Firebase must be configured for production.');
  }
  return ls.initializeDB();
}

export async function getTrips(slug, category) {
  if (useFirebase) return fbGetTrips(slug, category);
  return ls.getTrips(slug, category);
}

export async function addTrip(slug, category, tripData) {
  if (useFirebase) return fbAddTrip(slug, category, tripData);
  return ls.addTrip(slug, category, tripData);
}

export async function getPackages(pkgId) {
  if (useFirebase) return fbGetPackages(pkgId);
  return ls.getPackages(pkgId);
}

export async function addPackage(pkgId, packageData) {
  if (useFirebase) return fbAddPackage(pkgId, packageData);
  return ls.addPackage(pkgId, packageData);
}

export async function getAgents() {
  if (useFirebase) return fbGetAgents();
  return ls.getAgents();
}

export async function saveAgents(agents) {
  if (useFirebase) return fbSaveAgents(agents);
  return ls.saveAgents(agents);
}

export async function getAgentById(id) {
  if (useFirebase) return fbGetAgentById(id);
  return ls.getAgentById(id);
}

export async function getAgentByUsername(username) {
  if (useFirebase) return fbGetAgentByUsername(username);
  return ls.getAgentByUsername(username);
}

export async function addAgent(agentData) {
  if (useFirebase) return fbAddAgent(agentData);
  return ls.addAgent(agentData);
}

export async function getBookings() {
  if (useFirebase) return fbGetBookings();
  return ls.getBookings();
}

export async function saveBookings(bookings) {
  if (useFirebase) return fbSaveBookings(bookings);
  return ls.saveBookings(bookings);
}

export async function addBooking(bookingData) {
  if (useFirebase) return fbAddBooking(bookingData);
  return ls.addBooking(bookingData);
}

export async function updateBookingStatus(id, newStatus) {
  if (useFirebase) return fbUpdateBookingStatus(id, newStatus);
  return ls.updateBookingStatus(id, newStatus);
}

export async function getPromoCodes() {
  if (useFirebase) return fbGetPromoCodes();
  return ls.getPromoCodes();
}

export async function savePromoCodes(codes) {
  if (useFirebase) return fbSavePromoCodes(codes);
  return ls.savePromoCodes(codes);
}

export async function addPromoCode(codeData) {
  if (useFirebase) return fbAddPromoCode(codeData);
  return ls.addPromoCode(codeData);
}

export async function deletePromoCode(code) {
  if (useFirebase) return fbDeletePromoCode(code);
  return ls.deletePromoCode(code);
}

export async function validatePromoCode(codeStr) {
  if (useFirebase) return fbValidatePromoCode(codeStr);
  return ls.validatePromoCode(codeStr);
}

export async function consumePromoCode(codeStr) {
  if (useFirebase) return fbConsumePromoCode(codeStr);
  return ls.consumePromoCode(codeStr);
}

export async function getReviews() {
  if (useFirebase) return fbGetReviews();
  return ls.getReviews();
}

export async function addReview(reviewData) {
  if (useFirebase) return fbAddReview(reviewData);
  return ls.addReview(reviewData);
}

export async function getSocialMedia() {
  if (useFirebase) return fbGetSocialMedia();
  return ls.getSocialMedia();
}

export async function saveSocialMedia(socialData) {
  if (useFirebase) return fbSaveSocialMedia(socialData);
  return ls.saveSocialMedia(socialData);
}

export async function getSettings() {
  if (useFirebase) return fbGetSettings();
  return { 
    siteName: localStorage?.getItem('orluxus_site_name') || 'ORLUXUS', 
    whatsapp: localStorage?.getItem('orluxus_whatsapp') || '+20100000000',
    paypalEmail: localStorage?.getItem('orluxus_paypal_email') || 'info@orluxus.com'
  };
}

export async function saveSettings(settingsData) {
  if (useFirebase) return fbSaveSettings(settingsData);
  if (!isClient) return false;
  try {
    if (settingsData.siteName) localStorage.setItem('orluxus_site_name', settingsData.siteName);
    if (settingsData.whatsapp) localStorage.setItem('orluxus_whatsapp', settingsData.whatsapp);
    if (settingsData.paypalEmail) localStorage.setItem('orluxus_paypal_email', settingsData.paypalEmail);
    return true;
  } catch { return false; }
}
