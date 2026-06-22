/**
 * db.adapter.js — Unified Database Layer
 * 
 * Uses Upstash Redis (HTTP-based, no WebSockets) when configured.
 * Falls back to hardcoded defaults for zero-downtime operation.
 * Firebase has been completely removed to eliminate timeout errors.
 */

import {
  getTrips as upGetTrips,
  addTrip as upAddTrip,
  updateTrip as upUpdateTrip,
  deleteTrip as upDeleteTrip,
  getPackages as upGetPackages,
  addPackage as upAddPackage,
  updatePackage as upUpdatePackage,
  deletePackage as upDeletePackage,
  getAgents as upGetAgents,
  saveAgents as upSaveAgents,
  getAgentById as upGetAgentById,
  getAgentByUsername as upGetAgentByUsername,
  addAgent as upAddAgent,
  updateAgent as upUpdateAgent,
  deleteAgent as upDeleteAgent,
  getBookings as upGetBookings,
  saveBookings as upSaveBookings,
  addBooking as upAddBooking,
  updateBookingStatus as upUpdateBookingStatus,
  deleteBooking as upDeleteBooking,
  getPromoCodes as upGetPromoCodes,
  savePromoCodes as upSavePromoCodes,
  addPromoCode as upAddPromoCode,
  deletePromoCode as upDeletePromoCode,
  validatePromoCode as upValidatePromoCode,
  consumePromoCode as upConsumePromoCode,
  getReviews as upGetReviews,
  addReview as upAddReview,
  deleteReview as upDeleteReview,
  getSocialMedia as upGetSocialMedia,
  saveSocialMedia as upSaveSocialMedia,
  getSettings as upGetSettings,
  saveSettings as upSaveSettings,
  initializeDB as upInitializeDB,
  DEFAULT_AGENTS,
  DEFAULT_BOOKINGS,
  DEFAULT_PROMO_CODES,
  DEFAULT_REVIEWS,
  DEFAULT_SOCIAL,
  DEFAULT_SETTINGS,
  isUpstashConfigured,
} from './db.upstash';

import { sampleTrips } from './data';

// ==========================================
// CLIENT-SIDE (browser) localStorage helpers
// ==========================================
const isClient = typeof window !== 'undefined';
const isProd = process.env.NODE_ENV === 'production';

function lsGet(key, fallback = null) {
  if (isProd || !isClient) return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch { return fallback; }
}

function lsSet(key, value) {
  if (isProd || !isClient) return false;
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
    const newTrip = { id: `custom-trip-${Date.now()}`, currency: 'EUR', rating: 5.0, reviews: 1, image: tripData.image || '/images/trips/glass-boat.jpg', ...tripData };
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
  getSettings: () => DEFAULT_SETTINGS,
  saveSettings: () => false,
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
const useUpstash = !isClient; // Upstash is for server-side only

// -- TRIPS --
export async function getTrips(slug, category) {
  if (useUpstash) return upGetTrips(slug, category);
  return ls.getTrips(slug, category);
}
export async function addTrip(slug, category, tripData) {
  if (useUpstash) return upAddTrip(slug, category, tripData);
  return ls.addTrip(slug, category, tripData);
}
export async function updateTrip() { return false; }
export async function deleteTrip() { return false; }

// -- PACKAGES --
export async function getPackages(pkgId) {
  if (useUpstash) return upGetPackages(pkgId);
  return ls.getPackages(pkgId);
}
export async function addPackage(pkgId, packageData) {
  if (useUpstash) return upAddPackage(pkgId, packageData);
  return ls.addPackage(pkgId, packageData);
}
export async function updatePackage() { return false; }
export async function deletePackage() { return false; }

// -- AGENTS --
export async function getAgents() {
  if (useUpstash) return upGetAgents();
  return ls.getAgents();
}
export async function saveAgents(agents) {
  if (useUpstash) return upSaveAgents(agents);
  return ls.saveAgents(agents);
}
export async function getAgentById(id) {
  if (useUpstash) return upGetAgentById(id);
  return ls.getAgentById(id);
}
export async function getAgentByUsername(username) {
  if (useUpstash) return upGetAgentByUsername(username);
  return ls.getAgentByUsername(username);
}
export async function addAgent(agentData) {
  if (useUpstash) return upAddAgent(agentData);
  return ls.addAgent(agentData);
}
export async function updateAgent(id, agentData) {
  if (useUpstash) return upUpdateAgent(id, agentData);
  return false;
}
export async function deleteAgent(id) {
  if (useUpstash) return upDeleteAgent(id);
  return false;
}

// -- BOOKINGS --
export async function getBookings() {
  if (useUpstash) return upGetBookings();
  return ls.getBookings();
}
export async function saveBookings(bookings) {
  if (useUpstash) return upSaveBookings(bookings);
  return ls.saveBookings(bookings);
}
export async function addBooking(bookingData) {
  if (useUpstash) return upAddBooking(bookingData);
  return ls.addBooking(bookingData);
}
export async function updateBookingStatus(id, newStatus) {
  if (useUpstash) return upUpdateBookingStatus(id, newStatus);
  return ls.updateBookingStatus(id, newStatus);
}
export async function deleteBooking(id) {
  if (useUpstash) return upDeleteBooking(id);
  return false;
}

// -- PROMO CODES --
export async function getPromoCodes() {
  if (useUpstash) return upGetPromoCodes();
  return ls.getPromoCodes();
}
export async function savePromoCodes(codes) {
  if (useUpstash) return upSavePromoCodes(codes);
  return ls.savePromoCodes(codes);
}
export async function addPromoCode(codeData) {
  if (useUpstash) return upAddPromoCode(codeData);
  return ls.addPromoCode(codeData);
}
export async function deletePromoCode(code) {
  if (useUpstash) return upDeletePromoCode(code);
  return ls.deletePromoCode(code);
}
export async function validatePromoCode(codeStr) {
  if (useUpstash) return upValidatePromoCode(codeStr);
  return ls.validatePromoCode(codeStr);
}
export async function consumePromoCode(codeStr) {
  if (useUpstash) return upConsumePromoCode(codeStr);
  return ls.consumePromoCode(codeStr);
}

// -- REVIEWS --
export async function getReviews() {
  if (useUpstash) return upGetReviews();
  return ls.getReviews();
}
export async function addReview(reviewData) {
  if (useUpstash) return upAddReview(reviewData);
  return ls.addReview(reviewData);
}
export async function deleteReview(id) {
  if (useUpstash) return upDeleteReview(id);
  return false;
}

// -- SOCIAL MEDIA --
export async function getSocialMedia() {
  if (useUpstash) return upGetSocialMedia();
  return ls.getSocialMedia();
}
export async function saveSocialMedia(data) {
  if (useUpstash) return upSaveSocialMedia(data);
  return ls.saveSocialMedia(data);
}

// -- SETTINGS --
export async function getSettings() {
  if (useUpstash) return upGetSettings();
  return ls.getSettings();
}
export async function saveSettings(data) {
  if (useUpstash) return upSaveSettings(data);
  return ls.saveSettings(data);
}

// -- INIT --
export async function initializeDB() {
  if (useUpstash) return upInitializeDB();
  return ls.initializeDB();
}
