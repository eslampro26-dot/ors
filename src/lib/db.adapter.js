/**
 * db.adapter.js — Unified Database Layer
 * 
 * Uses Firebase Firestore when configured.
 * Falls back to localStorage in development mode.
 * Upstash Redis is removed for better performance and reliability.
 */

import {
  getTrips as fbGetTrips,
  addTrip as fbAddTrip,
  updateTrip as fbUpdateTrip,
  deleteTrip as fbDeleteTrip,
  getPackages as fbGetPackages,
  addPackage as fbAddPackage,
  updatePackage as fbUpdatePackage,
  deletePackage as fbDeletePackage,
  getAgents as fbGetAgents,
  saveAgents as fbSaveAgents,
  getAgentById as fbGetAgentById,
  getAgentByUsername as fbGetAgentByUsername,
  addAgent as fbAddAgent,
  updateAgent as fbUpdateAgent,
  deleteAgent as fbDeleteAgent,
  getBookings as fbGetBookings,
  saveBookings as fbSaveBookings,
  addBooking as fbAddBooking,
  updateBookingStatus as fbUpdateBookingStatus,
  deleteBooking as fbDeleteBooking,
  getPromoCodes as fbGetPromoCodes,
  savePromoCodes as fbSavePromoCodes,
  addPromoCode as fbAddPromoCode,
  deletePromoCode as fbDeletePromoCode,
  validatePromoCode as fbValidatePromoCode,
  consumePromoCode as fbConsumePromoCode,
  getReviews as fbGetReviews,
  addReview as fbAddReview,
  deleteReview as fbDeleteReview,
  getSocialMedia as fbGetSocialMedia,
  saveSocialMedia as fbSaveSocialMedia,
  getSettings as fbGetSettings,
  saveSettings as fbSaveSettings,
  initializeDB as fbInitializeDB,
  DEFAULT_AGENTS,
  DEFAULT_BOOKINGS,
  DEFAULT_PROMO_CODES,
  DEFAULT_REVIEWS,
  DEFAULT_SOCIAL,
  DEFAULT_SETTINGS,
  isFirebaseConfigured,
  subscribeToBookings,
  subscribeToReviews,
  subscribeToAgents
} from './db.firebase';

import { sampleTrips } from './data';

// ==========================================
// CLIENT-SIDE (browser) localStorage helpers
// ==========================================
const isClient = typeof window !== 'undefined';
const isProd = process.env.NODE_ENV === 'production';

function lsGet(key, fallback = null) {
  if (!isClient) return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch { return fallback; }
}

function lsSet(key, value) {
  if (!isClient) return false;
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { return false; }
}

// Browser-only localStorage layer (dev mode only)
const ls = {
  getTrips: (slug, category) => {
    const staticTrips = sampleTrips[slug]?.[category] || [];
    const custom = lsGet(`trips_${slug}_${category}`, []);
    return [...staticTrips, ...custom];
  },
  addTrip: (slug, category, tripData) => {
    const existing = lsGet(`trips_${slug}_${category}`, []);
    const newTrip = { id: `custom-trip-${Date.now()}`, currency: 'EUR', rating: 5.0, reviews: 1, image: tripData.image || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80', ...tripData };
    lsSet(`trips_${slug}_${category}`, [...existing, newTrip]);
    return newTrip;
  },
  getPackages: (pkgId) => lsGet(`packages_${pkgId}`, []),
  addPackage: (pkgId, packageData) => {
    const existing = lsGet(`packages_${pkgId}`, []);
    const newPkg = { id: `custom-pkg-${Date.now()}`, currency: 'EUR', rating: 5.0, reviews: 1, ...packageData };
    lsSet(`packages_${pkgId}`, [...existing, newPkg]);
    return newPkg;
  },
  getAgents: () => lsGet('agents_data', DEFAULT_AGENTS),
  saveAgents: (agents) => lsSet('agents_data', agents),
  getAgentById: (id) => {
    const agents = lsGet('agents_data', DEFAULT_AGENTS);
    return agents.find(a => String(a.id) === String(id)) || null;
  },
  getAgentByUsername: (username) => {
    const agents = lsGet('agents_data', DEFAULT_AGENTS);
    return agents.find(a => a.username?.toLowerCase() === username?.toLowerCase()) || null;
  },
  addAgent: (agentData) => {
    const agents = lsGet('agents_data', DEFAULT_AGENTS);
    const nextId = String(agents.length > 0 ? Math.max(...agents.map(a => parseInt(a.id) || 0)) + 1 : 1);
    const newAgent = { id: nextId, sales: 0, subAgents: 0, joinDate: new Date().toISOString().split('T')[0], status: 'نشط', promoCodes: [], parentId: null, ...agentData };
    lsSet('agents_data', [...agents, newAgent]);
    return newAgent;
  },
  getBookings: () => lsGet('bookings_data', DEFAULT_BOOKINGS),
  saveBookings: (bookings) => lsSet('bookings_data', bookings),
  addBooking: (bookingData) => {
    const bookings = lsGet('bookings_data', DEFAULT_BOOKINGS);
    const nextId = `BK-${Date.now().toString().slice(-6)}`;
    const newBooking = { id: nextId, date: new Date().toISOString().split('T')[0], status: 'مؤكد', ...bookingData };
    lsSet('bookings_data', [newBooking, ...bookings]);
    return newBooking;
  },
  updateBookingStatus: (id, newStatus) => {
    const bookings = lsGet('bookings_data', DEFAULT_BOOKINGS);
    const idx = bookings.findIndex(b => b.id === id);
    if (idx === -1) return false;
    bookings[idx] = { ...bookings[idx], status: newStatus };
    lsSet('bookings_data', bookings);
    return true;
  },
  getPromoCodes: () => lsGet('promo_codes', DEFAULT_PROMO_CODES),
  savePromoCodes: (codes) => lsSet('promo_codes', codes),
  addPromoCode: (codeData) => {
    const codes = lsGet('promo_codes', DEFAULT_PROMO_CODES);
    const cleanCode = codeData.code.trim().toUpperCase();
    if (codes.some(c => c.code === cleanCode)) return { error: 'كود الخصم هذا موجود بالفعل!' };
    const newCode = { ...codeData, code: cleanCode, usedCount: 0, isActive: true, createdAt: new Date().toISOString().split('T')[0] };
    lsSet('promo_codes', [...codes, newCode]);
    if (newCode.agentId) {
      const agents = lsGet('agents_data', DEFAULT_AGENTS);
      const aIdx = agents.findIndex(a => String(a.id) === String(newCode.agentId));
      if (aIdx !== -1) { agents[aIdx].promoCodes = [...(agents[aIdx].promoCodes || []), cleanCode]; lsSet('agents_data', agents); }
    }
    return newCode;
  },
  deletePromoCode: (code) => {
    const codes = lsGet('promo_codes', DEFAULT_PROMO_CODES);
    lsSet('promo_codes', codes.filter(c => c.code !== code));
    return true;
  },
  validatePromoCode: (codeStr) => {
    if (!codeStr) return { isValid: false, reason: 'الرجاء إدخال كود الخصم' };
    const codes = lsGet('promo_codes', DEFAULT_PROMO_CODES);
    const promo = codes.find(c => c.code.toUpperCase() === codeStr.trim().toUpperCase());
    if (!promo) return { isValid: false, reason: 'كود الخصم غير صحيح!' };
    if (!promo.isActive) return { isValid: false, reason: 'كود الخصم غير نشط!' };
    if (promo.maxUses && promo.usedCount >= promo.maxUses) return { isValid: false, reason: 'انتهى الحد الأقصى لهذا الكود!' };
    if (promo.expiryDate && new Date().toISOString().split('T')[0] > promo.expiryDate) return { isValid: false, reason: 'هذا الكود منتهي الصلاحية!' };
    const agents = lsGet('agents_data', DEFAULT_AGENTS);
    const agent = agents.find(a => String(a.id) === String(promo.agentId));
    if (agent && agent.status !== 'نشط') return { isValid: false, reason: 'كود الخصم هذا تابع لوكيل موقوف!' };
    return { isValid: true, code: promo.code, agentId: promo.agentId, agentName: agent?.name || 'مباشر', discountType: promo.discountType, discountValue: promo.discountValue };
  },
  consumePromoCode: (codeStr) => {
    const codes = lsGet('promo_codes', DEFAULT_PROMO_CODES);
    const idx = codes.findIndex(c => c.code.toUpperCase() === codeStr.trim().toUpperCase());
    if (idx === -1) return false;
    codes[idx].usedCount = (codes[idx].usedCount || 0) + 1;
    return lsSet('promo_codes', codes);
  },
  getReviews: () => lsGet('site_reviews', DEFAULT_REVIEWS),
  addReview: (reviewData) => {
    const reviews = lsGet('site_reviews', DEFAULT_REVIEWS);
    const newReview = { id: `rev-${Date.now()}`, date: new Date().toISOString().split('T')[0], ...reviewData };
    lsSet('site_reviews', [newReview, ...reviews]);
    return newReview;
  },
  getSocialMedia: () => DEFAULT_SOCIAL,
  saveSocialMedia: () => false,
  getSettings: () => lsGet('settings_data', DEFAULT_SETTINGS),
  saveSettings: (settingsData) => lsSet('settings_data', settingsData),
  initializeDB: () => {
    if (!isClient || isProd) return;
    if (!localStorage.getItem('agents_data')) lsSet('agents_data', DEFAULT_AGENTS);
    if (!localStorage.getItem('promo_codes')) lsSet('promo_codes', DEFAULT_PROMO_CODES);
    if (!localStorage.getItem('bookings_data')) lsSet('bookings_data', DEFAULT_BOOKINGS);
    if (!localStorage.getItem('site_reviews')) lsSet('site_reviews', DEFAULT_REVIEWS);
  },
};

// Auto-init localStorage in dev/browser
if (isClient && !isProd) ls.initializeDB();

// ==========================================
// ROUTING LOGIC
// Uses Upstash when on server (API routes).
// Uses localStorage when in browser (dev only).
// Always falls back to hardcoded defaults.
// ==========================================
// Client-side API caller
async function apiCall(url, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      cache: 'no-store',
    };
    if (body) {
      options.body = JSON.stringify(body);
    }
    const res = await fetch(url, options);
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`Error in apiCall to ${url}:`, err);
    return null;
  }
}

// ==========================================
// ROUTING LOGIC
// Uses Upstash when on server (API routes / SSR).
// Uses fetch API calls when in browser (client-side).
// ==========================================

// -- TRIPS --
export async function getTrips(slug, category) {
  if (!isClient) return fbGetTrips(slug, category);
  if (isFirebaseConfigured()) return fbGetTrips(slug, category);
  const res = await apiCall(`/api/trips?slug=${slug}&category=${category}`);
  return res || sampleTrips[slug]?.[category] || [];
}

export async function addTrip(slug, category, tripData) {
  // Always use API route for writes (avoids Firebase client-side permission errors)
  if (!isClient) return fbAddTrip(slug, category, tripData);
  return await apiCall('/api/trips', 'POST', { slug, category, ...tripData });
}

export async function updateTrip(id, tripData) {
  if (!isClient) return fbUpdateTrip(id, tripData);
  const res = await apiCall('/api/trips', 'PUT', { id, ...tripData });
  return res ? res.success : false;
}

export async function deleteTrip(slug, category, id) {
  if (!isClient) return fbDeleteTrip(slug, category, id);
  const res = await apiCall('/api/trips', 'DELETE', { slug, category, id });
  return res ? res.success : false;
}

// -- PACKAGES --
export async function getPackages(pkgId) {
  if (!isClient) return fbGetPackages(pkgId);
  if (isFirebaseConfigured()) return fbGetPackages(pkgId);
  return await apiCall(`/api/packages?pkgId=${pkgId}`) || [];
}

export async function addPackage(pkgId, packageData) {
  // Always use API route for writes
  if (!isClient) return fbAddPackage(pkgId, packageData);
  return await apiCall('/api/packages', 'POST', { pkgId, ...packageData });
}

export async function updatePackage(pkgId, id, packageData) {
  if (!isClient) return fbUpdatePackage(pkgId, id, packageData);
  const res = await apiCall('/api/packages', 'PUT', { pkgId, id, ...packageData });
  return res ? res.success : false;
}

export async function deletePackage(pkgId, id) {
  if (!isClient) return fbDeletePackage(pkgId, id);
  const res = await apiCall('/api/packages', 'DELETE', { pkgId, id });
  return res ? res.success : false;
}

// -- AGENTS --
export async function getAgents() {
  if (!isClient) return fbGetAgents();
  if (isFirebaseConfigured()) return fbGetAgents();
  return await apiCall('/api/agents') || DEFAULT_AGENTS;
}

export async function saveAgents(agents) {
  if (!isClient) return fbSaveAgents(agents);
  if (isFirebaseConfigured()) return fbSaveAgents(agents);
  // We will call the PUT api/agents for updating statuses, but we also support bulk save
  const res = await apiCall('/api/agents', 'PUT', { bulk: true, agents });
  return res ? res.success : false;
}

export async function getAgentById(id) {
  if (!isClient) return fbGetAgentById(id);
  const agents = await getAgents();
  return agents.find(a => String(a.id) === String(id)) || null;
}

export async function getAgentByUsername(username) {
  if (!isClient) return fbGetAgentByUsername(username);
  const agents = await getAgents();
  return agents.find(a => a.username?.toLowerCase() === username?.toLowerCase()) || null;
}

export async function addAgent(agentData) {
  if (!isClient) return fbAddAgent(agentData);
  return await apiCall('/api/agents', 'POST', agentData);
}

export async function updateAgent(id, agentData) {
  if (!isClient) return fbUpdateAgent(id, agentData);
  const res = await apiCall('/api/agents', 'PUT', { id, ...agentData });
  return res ? res.success : false;
}

export async function deleteAgent(id) {
  if (!isClient) return fbDeleteAgent(id);
  const res = await apiCall('/api/agents', 'DELETE', { id });
  return res ? res.success : false;
}

// -- BOOKINGS --
export async function getBookings() {
  if (!isClient) return fbGetBookings();
  if (isFirebaseConfigured()) return fbGetBookings();
  return await apiCall('/api/bookings') || DEFAULT_BOOKINGS;
}

export async function saveBookings(bookings) {
  if (!isClient) return fbSaveBookings(bookings);
  return false;
}

export async function addBooking(bookingData) {
  if (!isClient) return fbAddBooking(bookingData);
  return await apiCall('/api/bookings', 'POST', bookingData);
}

export async function updateBookingStatus(id, newStatus) {
  if (!isClient) return fbUpdateBookingStatus(id, newStatus);
  const res = await apiCall('/api/bookings', 'PUT', { id, status: newStatus });
  return res ? res.success : false;
}

export async function deleteBooking(id) {
  if (!isClient) return fbDeleteBooking(id);
  const res = await apiCall('/api/bookings', 'DELETE', { id });
  return res ? res.success : false;
}

// -- PROMO CODES --
export async function getPromoCodes() {
  if (!isClient) return fbGetPromoCodes();
  return await apiCall('/api/promo-codes') || DEFAULT_PROMO_CODES;
}

export async function savePromoCodes(codes) {
  if (!isClient) return fbSavePromoCodes(codes);
  const res = await apiCall('/api/promo-codes', 'PUT', codes);
  return res ? res.success : false;
}

export async function addPromoCode(codeData) {
  if (!isClient) return fbAddPromoCode(codeData);
  return await apiCall('/api/promo-codes', 'POST', codeData);
}

export async function deletePromoCode(code) {
  if (!isClient) return fbDeletePromoCode(code);
  const res = await apiCall('/api/promo-codes', 'DELETE', { code });
  return res ? res.success : false;
}

export async function validatePromoCode(codeStr) {
  if (!isClient) return fbValidatePromoCode(codeStr);
  return await apiCall(`/api/promo-codes?validate=${codeStr}`);
}

export async function consumePromoCode(codeStr) {
  if (!isClient) return fbConsumePromoCode(codeStr);
  const res = await apiCall('/api/promo-codes', 'POST', { action: 'use', code: codeStr });
  return res ? res.success : false;
}

// -- REVIEWS --
export async function getReviews() {
  if (!isClient) return fbGetReviews();
  return await apiCall('/api/reviews') || DEFAULT_REVIEWS;
}

export async function addReview(reviewData) {
  if (!isClient) return fbAddReview(reviewData);
  return await apiCall('/api/reviews', 'POST', reviewData);
}

export async function deleteReview(id) {
  if (!isClient) return fbDeleteReview(id);
  return false;
}

// -- SOCIAL MEDIA --
export async function getSocialMedia() {
  if (!isClient) return fbGetSocialMedia();
  const settings = await apiCall('/api/settings');
  return settings || DEFAULT_SOCIAL;
}

export async function saveSocialMedia(data) {
  if (!isClient) return fbSaveSocialMedia(data);
  const res = await apiCall('/api/settings', 'POST', { type: 'social', data });
  return res ? res.success : false;
}

// -- SETTINGS --
export async function getSettings() {
  if (!isClient) return fbGetSettings();
  const settings = await apiCall('/api/settings');
  return settings || DEFAULT_SETTINGS;
}

export async function saveSettings(data) {
  if (!isClient) return fbSaveSettings(data);
  const res = await apiCall('/api/settings', 'POST', data);
  return res ? res.success : false;
}

// -- INIT --
export async function initializeDB() {
  if (!isClient) return fbInitializeDB();
  if (isFirebaseConfigured()) {
    const result = await fbInitializeDB();
    if (result) {
      console.log('تم تهيئة قاعدة البيانات Firebase بنجاح');
      return true;
    } else {
      console.error('فشل تهيئة قاعدة البيانات Firebase، سيتم استخدام localStorage بديلاً');
    }
  }
  // تهيئة localStorage إذا لم تكن موجودة بالفعل
  if (!isProd) {
    if (!localStorage.getItem('agents_data')) lsSet('agents_data', DEFAULT_AGENTS);
    if (!localStorage.getItem('promo_codes')) lsSet('promo_codes', DEFAULT_PROMO_CODES);
    if (!localStorage.getItem('bookings_data')) lsSet('bookings_data', DEFAULT_BOOKINGS);
    if (!localStorage.getItem('site_reviews')) lsSet('site_reviews', DEFAULT_REVIEWS);
  }
  return true;
}

// تصدير الدوال المفقودة
export { subscribeToBookings, subscribeToReviews, subscribeToAgents };

