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
// Client-side API caller
async function apiCall(url, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
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
  if (!isClient) return upGetTrips(slug, category);
  const res = await apiCall(`/api/trips?slug=${slug}&category=${category}`);
  return res || sampleTrips[slug]?.[category] || [];
}

export async function addTrip(slug, category, tripData) {
  if (!isClient) return upAddTrip(slug, category, tripData);
  return await apiCall('/api/trips', 'POST', { slug, category, ...tripData });
}

export async function updateTrip(id, tripData) {
  if (!isClient) return upUpdateTrip(id, tripData);
  const res = await apiCall('/api/trips', 'PUT', { id, ...tripData });
  return res ? res.success : false;
}

export async function deleteTrip(slug, category, id) {
  if (!isClient) return upDeleteTrip(slug, category, id);
  const res = await apiCall('/api/trips', 'DELETE', { slug, category, id });
  return res ? res.success : false;
}

// -- PACKAGES --
export async function getPackages(pkgId) {
  if (!isClient) return upGetPackages(pkgId);
  return await apiCall(`/api/packages?pkgId=${pkgId}`) || [];
}

export async function addPackage(pkgId, packageData) {
  if (!isClient) return upAddPackage(pkgId, packageData);
  return await apiCall('/api/packages', 'POST', { pkgId, ...packageData });
}

export async function updatePackage() {
  return false;
}

export async function deletePackage(pkgId, id) {
  if (!isClient) return upDeletePackage(pkgId, id);
  const res = await apiCall('/api/packages', 'DELETE', { pkgId, id });
  return res ? res.success : false;
}

// -- AGENTS --
export async function getAgents() {
  if (!isClient) return upGetAgents();
  return await apiCall('/api/agents') || DEFAULT_AGENTS;
}

export async function saveAgents(agents) {
  if (!isClient) return upSaveAgents(agents);
  // We will call the PUT api/agents for updating statuses, but we also support bulk save
  const res = await apiCall('/api/agents', 'PUT', { bulk: true, agents });
  return res ? res.success : false;
}

export async function getAgentById(id) {
  if (!isClient) return upGetAgentById(id);
  const agents = await getAgents();
  return agents.find(a => String(a.id) === String(id)) || null;
}

export async function getAgentByUsername(username) {
  if (!isClient) return upGetAgentByUsername(username);
  const agents = await getAgents();
  return agents.find(a => a.username?.toLowerCase() === username?.toLowerCase()) || null;
}

export async function addAgent(agentData) {
  if (!isClient) return upAddAgent(agentData);
  return await apiCall('/api/agents', 'POST', agentData);
}

export async function updateAgent(id, agentData) {
  if (!isClient) return upUpdateAgent(id, agentData);
  const res = await apiCall('/api/agents', 'PUT', { id, ...agentData });
  return res ? res.success : false;
}

export async function deleteAgent(id) {
  if (!isClient) return upDeleteAgent(id);
  const res = await apiCall('/api/agents', 'DELETE', { id });
  return res ? res.success : false;
}

// -- BOOKINGS --
export async function getBookings() {
  if (!isClient) return upGetBookings();
  return await apiCall('/api/bookings') || DEFAULT_BOOKINGS;
}

export async function saveBookings(bookings) {
  if (!isClient) return upSaveBookings(bookings);
  return false;
}

export async function addBooking(bookingData) {
  if (!isClient) return upAddBooking(bookingData);
  return await apiCall('/api/bookings', 'POST', bookingData);
}

export async function updateBookingStatus(id, newStatus) {
  if (!isClient) return upUpdateBookingStatus(id, newStatus);
  const res = await apiCall('/api/bookings', 'PUT', { id, status: newStatus });
  return res ? res.success : false;
}

export async function deleteBooking(id) {
  if (!isClient) return upDeleteBooking(id);
  const res = await apiCall('/api/bookings', 'DELETE', { id });
  return res ? res.success : false;
}

// -- PROMO CODES --
export async function getPromoCodes() {
  if (!isClient) return upGetPromoCodes();
  return await apiCall('/api/promo-codes') || DEFAULT_PROMO_CODES;
}

export async function savePromoCodes(codes) {
  if (!isClient) return upSavePromoCodes(codes);
  const res = await apiCall('/api/promo-codes', 'PUT', codes);
  return res ? res.success : false;
}

export async function addPromoCode(codeData) {
  if (!isClient) return upAddPromoCode(codeData);
  return await apiCall('/api/promo-codes', 'POST', codeData);
}

export async function deletePromoCode(code) {
  if (!isClient) return upDeletePromoCode(code);
  const res = await apiCall('/api/promo-codes', 'DELETE', { code });
  return res ? res.success : false;
}

export async function validatePromoCode(codeStr) {
  if (!isClient) return upValidatePromoCode(codeStr);
  return await apiCall(`/api/promo-codes?validate=${codeStr}`);
}

export async function consumePromoCode(codeStr) {
  if (!isClient) return upConsumePromoCode(codeStr);
  const res = await apiCall('/api/promo-codes', 'POST', { action: 'use', code: codeStr });
  return res ? res.success : false;
}

// -- REVIEWS --
export async function getReviews() {
  if (!isClient) return upGetReviews();
  return await apiCall('/api/reviews') || DEFAULT_REVIEWS;
}

export async function addReview(reviewData) {
  if (!isClient) return upAddReview(reviewData);
  return await apiCall('/api/reviews', 'POST', reviewData);
}

export async function deleteReview(id) {
  if (!isClient) return upDeleteReview(id);
  return false;
}

// -- SOCIAL MEDIA --
export async function getSocialMedia() {
  if (!isClient) return upGetSocialMedia();
  const settings = await apiCall('/api/settings');
  return settings || DEFAULT_SOCIAL;
}

export async function saveSocialMedia(data) {
  if (!isClient) return upSaveSocialMedia(data);
  const res = await apiCall('/api/settings', 'POST', { type: 'social', data });
  return res ? res.success : false;
}

// -- SETTINGS --
export async function getSettings() {
  if (!isClient) return upGetSettings();
  const settings = await apiCall('/api/settings');
  return settings || DEFAULT_SETTINGS;
}

export async function saveSettings(data) {
  if (!isClient) return upSaveSettings(data);
  const res = await apiCall('/api/settings', 'POST', data);
  return res ? res.success : false;
}

// -- INIT --
export async function initializeDB() {
  if (!isClient) return upInitializeDB();
  return true;
}

