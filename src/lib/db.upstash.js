/**
 * Upstash Redis Database Layer
 * Uses pure HTTP REST API — no WebSockets, no timeouts, works perfectly on Vercel.
 * 
 * To enable: Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to Vercel env vars.
 * Get them free at: https://console.upstash.com → Create Redis → REST API tab
 */

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

export const isUpstashConfigured = () => !!(REDIS_URL && REDIS_TOKEN);

// --- Core Redis HTTP Commands ---
async function redisCmd(...args) {
  if (!isUpstashConfigured()) return null;
  try {
    const res = await fetch(`${REDIS_URL}/${args.map(encodeURIComponent).join('/')}`, {
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
      cache: 'no-store',
    });
    const json = await res.json();
    return json.result;
  } catch {
    return null;
  }
}

async function kvGet(key) {
  const raw = await redisCmd('GET', key);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return raw; }
}

async function kvSet(key, value) {
  const res = await redisCmd('SET', key, JSON.stringify(value));
  return res === 'OK';
}

async function kvGetOrSet(key, defaultValue) {
  const existing = await kvGet(key);
  if (existing !== null) return existing;
  await kvSet(key, defaultValue);
  return defaultValue;
}

// ==========================================
// DEFAULT DATA (source of truth)
// ==========================================
import { sampleTrips } from './data';

export const DEFAULT_AGENTS = [
  { id: '1', name: 'أحمد محمود',      email: 'ahmed@example.com',   username: 'ahmed',   password: 'Agent@2026!Sec', tier: 'silver',   sales: 105000, subAgents: 3, joinDate: '2026-01-10', status: 'نشط',    parentId: '5', promoCodes: ['AHMED10']   },
  { id: '2', name: 'سارة إبراهيم',    email: 'sara@example.com',    username: 'sara',    password: 'Agent@2026!Sec', tier: 'gold',     sales: 98500,  subAgents: 0, joinDate: '2025-11-20', status: 'نشط',    parentId: '5', promoCodes: ['SARA20']    },
  { id: '3', name: 'خالد عبد الرحمن', email: 'khaled@example.com',  username: 'khaled',  password: 'Agent@2026!Sec', tier: 'silver',   sales: 85200,  subAgents: 0, joinDate: '2026-02-05', status: 'نشط',    parentId: '5', promoCodes: ['KHALED15']  },
  { id: '4', name: 'منى جمال',        email: 'mona@example.com',    username: 'mona',    password: 'Agent@2026!Sec', tier: 'bronze',   sales: 75000,  subAgents: 0, joinDate: '2026-03-15', status: 'موقوف',  parentId: '1', promoCodes: ['MONA5']     },
  { id: '5', name: 'طارق زياد',       email: 'tarek@example.com',   username: 'tarek',   password: 'Agent@2026!Sec', tier: 'platinum', sales: 250000, subAgents: 4, joinDate: '2025-05-10', status: 'نشط',    parentId: null, promoCodes: ['TAREK25']  },
  { id: '6', name: 'يوسف سليم',       email: 'youssef@example.com', username: 'youssef', password: 'Agent@2026!Sec', tier: 'bronze',   sales: 20000,  subAgents: 0, joinDate: '2026-04-01', status: 'نشط',    parentId: '1', promoCodes: ['YOUSSEF10'] },
  { id: '7', name: 'حازم عمر',        email: 'hazem@example.com',   username: 'hazem',   password: 'Agent@2026!Sec', tier: 'bronze',   sales: 12000,  subAgents: 0, joinDate: '2026-04-10', status: 'نشط',    parentId: '1', promoCodes: ['HAZEM10']   },
];

export const DEFAULT_PROMO_CODES = [
  { code: 'AHMED10',   agentId: '1', discountType: 'percentage', discountValue: 10, maxUses: 100, usedCount: 5,  isActive: true, expiryDate: '2026-12-31', createdAt: '2026-01-10', createdBy: 'admin' },
  { code: 'SARA20',    agentId: '2', discountType: 'percentage', discountValue: 20, maxUses: 50,  usedCount: 12, isActive: true, expiryDate: '2026-12-31', createdAt: '2025-11-20', createdBy: 'admin' },
  { code: 'KHALED15',  agentId: '3', discountType: 'percentage', discountValue: 15, maxUses: 100, usedCount: 8,  isActive: true, expiryDate: '2026-12-31', createdAt: '2026-02-05', createdBy: 'admin' },
  { code: 'MONA5',     agentId: '4', discountType: 'percentage', discountValue: 5,  maxUses: 200, usedCount: 3,  isActive: true, expiryDate: '2026-12-31', createdAt: '2026-03-15', createdBy: 'admin' },
  { code: 'TAREK25',   agentId: '5', discountType: 'percentage', discountValue: 25, maxUses: 50,  usedCount: 22, isActive: true, expiryDate: '2026-12-31', createdAt: '2025-05-10', createdBy: 'admin' },
  { code: 'YOUSSEF10', agentId: '6', discountType: 'percentage', discountValue: 10, maxUses: 100, usedCount: 2,  isActive: true, expiryDate: '2026-12-31', createdAt: '2026-04-01', createdBy: 'admin' },
  { code: 'HAZEM10',   agentId: '7', discountType: 'percentage', discountValue: 10, maxUses: 100, usedCount: 1,  isActive: true, expiryDate: '2026-12-31', createdAt: '2026-04-10', createdBy: 'admin' },
];

export const DEFAULT_BOOKINGS = [
  { id: 'BK-1001', date: '2026-05-21', customer: 'محمد علي',      phone: '01012345678', service: 'رحلة جزيرة تيران',    city: 'شرم الشيخ', agentId: '1', agentName: 'أحمد محمود',      originalAmount: 70, discountAmount: 7,  finalAmount: 63, travelers: 2, status: 'مؤكد',          promoCode: 'AHMED10',  paymentType: 'paypal' },
  { id: 'BK-1002', date: '2026-05-21', customer: 'سارة إبراهيم',  phone: '01123456789', service: 'عشاء بدوي مع عرض',   city: 'شرم الشيخ', agentId: null, agentName: 'مباشر',           originalAmount: 30, discountAmount: 0,  finalAmount: 30, travelers: 1, status: 'قيد الانتظار', promoCode: '',         paymentType: 'cash'   },
  { id: 'BK-1003', date: '2026-05-20', customer: 'كريم مصطفى',    phone: '01234567890', service: 'سفاري رباعي الدفع',  city: 'الغردقة',  agentId: '3', agentName: 'خالد عبد الرحمن', originalAmount: 80, discountAmount: 12, finalAmount: 68, travelers: 2, status: 'مكتمل',         promoCode: 'KHALED15', paymentType: 'paypal' },
  { id: 'BK-1004', date: '2026-05-20', customer: 'منى يوسف',      phone: '01512345678', service: 'رحلة جزيرة الجفتون', city: 'الغردقة',  agentId: '2', agentName: 'سارة إبراهيم',   originalAmount: 50, discountAmount: 10, finalAmount: 40, travelers: 2, status: 'مؤكد',          promoCode: 'SARA20',   paymentType: 'paypal' },
  { id: 'BK-1005', date: '2026-05-19', customer: 'طارق حسن',      phone: '01098765432', service: 'غوص للمبتدئين',      city: 'مرسى علم', agentId: '1', agentName: 'أحمد محمود',      originalAmount: 50, discountAmount: 5,  finalAmount: 45, travelers: 1, status: 'ملغي',          promoCode: 'AHMED10',  paymentType: 'cash'   },
];

export const DEFAULT_REVIEWS = [
  { id: 'rev-1', name: 'Sophie L.',    country: 'France',  rating: 5, text: 'Absolutely spectacular yacht trip. The family atmosphere made us feel so safe and welcomed.', date: '2026-05-20' },
  { id: 'rev-2', name: 'Michael K.',   country: 'Germany', rating: 5, text: 'Seamless reservation via PayPal, instant PDF invoice, and the private airport transfer was punctual.', date: '2026-05-18' },
  { id: 'rev-3', name: 'Ahmed A.',     country: 'Egypt',   rating: 5, text: 'Best safari in Sharm El Sheikh. Outstanding organization, and very respectful staff.', date: '2026-05-15' },
];

export const DEFAULT_SETTINGS = {
  siteName: 'ORLUXUS',
  whatsapp: '+20100000000',
  paypalEmail: 'info@orluxus.com',
};

export const DEFAULT_SOCIAL = {
  email: 'info@orluxus.com',
  facebook: 'https://facebook.com/orluxus',
  tiktok: 'https://www.tiktok.com/@orluxus',
  instagram: 'https://www.instagram.com/orluxus',
};

// ==========================================
// TRIPS & PACKAGES
// ==========================================
export async function getTrips(slug, category) {
  const staticTrips = (sampleTrips[slug]?.[category]) || [];
  if (!isUpstashConfigured()) return staticTrips;
  const custom = await kvGet(`trips:${slug}:${category}`) || [];
  return [...staticTrips, ...custom];
}

export async function addTrip(slug, category, tripData) {
  const newTrip = { id: `custom-trip-${Date.now()}`, currency: 'EUR', rating: 5.0, reviews: 1, image: tripData.image || '/images/trips/glass-boat.jpg', ...tripData };
  if (!isUpstashConfigured()) return newTrip;
  const existing = await kvGet(`trips:${slug}:${category}`) || [];
  await kvSet(`trips:${slug}:${category}`, [...existing, newTrip]);
  return newTrip;
}

export async function getPackages(pkgId) {
  if (!isUpstashConfigured()) return [];
  return await kvGet(`packages:${pkgId}`) || [];
}

export async function addPackage(pkgId, packageData) {
  const newPkg = { id: `custom-pkg-${Date.now()}`, currency: 'EUR', rating: 5.0, reviews: 1, ...packageData };
  if (!isUpstashConfigured()) return newPkg;
  const existing = await kvGet(`packages:${pkgId}`) || [];
  await kvSet(`packages:${pkgId}`, [...existing, newPkg]);
  return newPkg;
}

// ==========================================
// AGENTS
// ==========================================
export async function getAgents() {
  if (!isUpstashConfigured()) return DEFAULT_AGENTS;
  return await kvGetOrSet('agents', DEFAULT_AGENTS);
}

export async function saveAgents(agents) {
  if (!isUpstashConfigured()) return false;
  return await kvSet('agents', agents);
}

export async function getAgentById(id) {
  const agents = await getAgents();
  return agents.find(a => String(a.id) === String(id)) || null;
}

export async function getAgentByUsername(username) {
  const agents = await getAgents();
  return agents.find(a => a.username?.toLowerCase() === username?.toLowerCase()) || null;
}

export async function addAgent(agentData) {
  const agents = await getAgents();
  const nextId = String(agents.length > 0 ? Math.max(...agents.map(a => parseInt(a.id) || 0)) + 1 : 1);
  const newAgent = { id: nextId, sales: 0, subAgents: 0, joinDate: new Date().toISOString().split('T')[0], status: 'نشط', promoCodes: [], parentId: null, ...agentData };
  if (newAgent.parentId) {
    const parentIdx = agents.findIndex(a => String(a.id) === String(newAgent.parentId));
    if (parentIdx !== -1) agents[parentIdx].subAgents = (agents[parentIdx].subAgents || 0) + 1;
  }
  await saveAgents([...agents, newAgent]);
  return newAgent;
}

export async function updateAgent(id, agentData) {
  const agents = await getAgents();
  const idx = agents.findIndex(a => String(a.id) === String(id));
  if (idx === -1) return false;
  agents[idx] = { ...agents[idx], ...agentData };
  return await saveAgents(agents);
}

export async function deleteAgent(id) {
  const agents = await getAgents();
  return await saveAgents(agents.filter(a => String(a.id) !== String(id)));
}

// ==========================================
// BOOKINGS
// ==========================================
export async function getBookings() {
  if (!isUpstashConfigured()) return DEFAULT_BOOKINGS;
  return await kvGetOrSet('bookings', DEFAULT_BOOKINGS);
}

export async function saveBookings(bookings) {
  if (!isUpstashConfigured()) return false;
  return await kvSet('bookings', bookings);
}

export async function addBooking(bookingData) {
  const bookings = await getBookings();
  const nextId = `BK-${Date.now().toString().slice(-6)}`;
  const newBooking = { id: nextId, date: new Date().toISOString().split('T')[0], status: 'مؤكد', ...bookingData };
  await saveBookings([newBooking, ...bookings]);
  return newBooking;
}

export async function updateBookingStatus(id, newStatus) {
  const bookings = await getBookings();
  const idx = bookings.findIndex(b => b.id === id);
  if (idx === -1) return false;
  bookings[idx] = { ...bookings[idx], status: newStatus };
  return await saveBookings(bookings);
}

export async function deleteBooking(id) {
  const bookings = await getBookings();
  return await saveBookings(bookings.filter(b => b.id !== id));
}

// ==========================================
// PROMO CODES
// ==========================================
export async function getPromoCodes() {
  if (!isUpstashConfigured()) return DEFAULT_PROMO_CODES;
  return await kvGetOrSet('promo_codes', DEFAULT_PROMO_CODES);
}

export async function savePromoCodes(codes) {
  if (!isUpstashConfigured()) return false;
  return await kvSet('promo_codes', codes);
}

export async function addPromoCode(codeData) {
  const codes = await getPromoCodes();
  const cleanCode = codeData.code.trim().toUpperCase();
  if (codes.some(c => c.code === cleanCode)) return { error: 'كود الخصم هذا موجود بالفعل!' };
  const newCode = { ...codeData, code: cleanCode, usedCount: 0, isActive: true, createdAt: new Date().toISOString().split('T')[0] };
  await savePromoCodes([...codes, newCode]);
  // also update agent's promoCodes list
  if (newCode.agentId) {
    const agents = await getAgents();
    const aIdx = agents.findIndex(a => String(a.id) === String(newCode.agentId));
    if (aIdx !== -1) {
      agents[aIdx].promoCodes = [...(agents[aIdx].promoCodes || []), cleanCode];
      await saveAgents(agents);
    }
  }
  return newCode;
}

export async function deletePromoCode(code) {
  const codes = await getPromoCodes();
  await savePromoCodes(codes.filter(c => c.code !== code));
  return true;
}

export async function validatePromoCode(codeStr) {
  if (!codeStr) return { isValid: false, reason: 'الرجاء إدخال كود الخصم' };
  const codes = await getPromoCodes();
  const promo = codes.find(c => c.code.toUpperCase() === codeStr.trim().toUpperCase());
  if (!promo) return { isValid: false, reason: 'كود الخصم غير صحيح!' };
  if (!promo.isActive) return { isValid: false, reason: 'كود الخصم غير نشط حالياً!' };
  if (promo.maxUses && promo.usedCount >= promo.maxUses) return { isValid: false, reason: 'انتهى الحد الأقصى لهذا الكود!' };
  if (promo.expiryDate) {
    const today = new Date().toISOString().split('T')[0];
    if (today > promo.expiryDate) return { isValid: false, reason: 'هذا الكود منتهي الصلاحية!' };
  }
  let agentName = 'مباشر (بدون وكيل)';
  if (promo.agentId) {
    const agent = await getAgentById(promo.agentId);
    if (agent) {
      if (agent.status !== 'نشط') return { isValid: false, reason: 'كود الخصم هذا تابع لوكيل موقوف!' };
      agentName = agent.name;
    }
  }
  return { isValid: true, code: promo.code, agentId: promo.agentId, agentName, discountType: promo.discountType, discountValue: promo.discountValue };
}

export async function consumePromoCode(codeStr) {
  const codes = await getPromoCodes();
  const idx = codes.findIndex(c => c.code.toUpperCase() === codeStr.trim().toUpperCase());
  if (idx === -1) return false;
  codes[idx].usedCount = (codes[idx].usedCount || 0) + 1;
  return await savePromoCodes(codes);
}

// ==========================================
// REVIEWS
// ==========================================
export async function getReviews() {
  if (!isUpstashConfigured()) return DEFAULT_REVIEWS;
  return await kvGetOrSet('reviews', DEFAULT_REVIEWS);
}

export async function addReview(reviewData) {
  const reviews = await getReviews();
  const newReview = { id: `rev-${Date.now()}`, date: new Date().toISOString().split('T')[0], ...reviewData };
  await kvSet('reviews', [newReview, ...reviews]);
  return newReview;
}

export async function deleteReview(id) {
  const reviews = await getReviews();
  return await kvSet('reviews', reviews.filter(r => r.id !== id));
}

// ==========================================
// SOCIAL MEDIA & SETTINGS
// ==========================================
export async function getSocialMedia() {
  if (!isUpstashConfigured()) return DEFAULT_SOCIAL;
  return await kvGetOrSet('social_media', DEFAULT_SOCIAL);
}

export async function saveSocialMedia(data) {
  if (!isUpstashConfigured()) return false;
  const current = await getSocialMedia();
  return await kvSet('social_media', { ...current, ...data });
}

export async function getSettings() {
  if (!isUpstashConfigured()) return DEFAULT_SETTINGS;
  return await kvGetOrSet('settings', DEFAULT_SETTINGS);
}

export async function saveSettings(data) {
  if (!isUpstashConfigured()) return false;
  const current = await getSettings();
  return await kvSet('settings', { ...current, ...data });
}

// ==========================================
// INIT (no-op, data auto-seeded on first read)
// ==========================================
export async function initializeDB() {
  return true;
}

export async function updateTrip() { return false; }

export async function deleteTrip(slug, category, id) {
  if (!isUpstashConfigured()) return true;
  const existing = await kvGet(`trips:${slug}:${category}`) || [];
  const filtered = existing.filter(t => t.id !== id);
  return await kvSet(`trips:${slug}:${category}`, filtered);
}

export async function updatePackage() { return false; }

export async function deletePackage(pkgId, id) {
  if (!isUpstashConfigured()) return true;
  const existing = await kvGet(`packages:${pkgId}`) || [];
  const filtered = existing.filter(p => p.id !== id);
  return await kvSet(`packages:${pkgId}`, filtered);
}

export async function savePromoCodes_alias(codes) { return savePromoCodes(codes); }
