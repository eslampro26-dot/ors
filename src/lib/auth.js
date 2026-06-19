import crypto from 'crypto';

/**
 * ORLUXUS Security Module
 * Handles admin authentication, API protection, and session management.
 */

// ─── Admin Credentials (from env, never hardcoded) ───
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (process.env.NODE_ENV === 'production' && !ADMIN_PASSWORD) {
  throw new Error('CRITICAL SECURITY ERROR: ADMIN_PASSWORD environment variable is not set in production. The application will not start to prevent unauthorized access.');
}

// Fallback to random secure string if env is not defined to prevent static guessable key vulnerability
const fallbackSecret = crypto.randomBytes(32).toString('hex');
const API_SECRET    = process.env.API_SECRET_TOKEN || fallbackSecret;

if (!process.env.API_SECRET_TOKEN) {
  console.warn('WARNING: API_SECRET_TOKEN is not set. A temporary random secret has been generated.');
  if (process.env.NODE_ENV === 'production') {
     throw new Error('CRITICAL SECURITY ERROR: API_SECRET_TOKEN must be set in production to maintain session stability across serverless function cold starts.');
  }
}

/**
 * Helper to sign token payload with HMAC-SHA256
 */
function signPayload(payload) {
  const serialized = JSON.stringify(payload);
  const base64Payload = Buffer.from(serialized).toString('base64url');
  const signature = crypto
    .createHmac('sha256', API_SECRET)
    .update(base64Payload)
    .digest('base64url');
  return `${base64Payload}.${signature}`;
}

/**
 * Helper to verify and decode HMAC-SHA256 signed token
 */
function verifySignedToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [base64Payload, signature] = parts;
  
  try {
    const expectedSignature = crypto
      .createHmac('sha256', API_SECRET)
      .update(base64Payload)
      .digest('base64url');
      
    // Secure constant-time comparison to prevent timing attacks
    const buf1 = Buffer.from(signature);
    const buf2 = Buffer.from(expectedSignature);
    if (buf1.length !== buf2.length || !crypto.timingSafeEqual(buf1, buf2)) {
      return null;
    }
    
    const serialized = Buffer.from(base64Payload, 'base64url').toString('utf-8');
    const payload = JSON.parse(serialized);
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Verify admin credentials (server-side only).
 * @param {string} username
 * @param {string} password
 * @returns {boolean}
 */
export function verifyAdminCredentials(username, password) {
  if (!username || !password) return false;
  const usernameMatch = username.trim() === ADMIN_USERNAME;
  const passwordMatch = password === ADMIN_PASSWORD;
  return usernameMatch && passwordMatch;
}

/**
 * Generate a cryptographically signed token for the admin.
 * @returns {string}
 */
export function generateAdminToken() {
  const payload = {
    role: 'admin',
    iat: Date.now(),
    exp: Date.now() + 1000 * 60 * 60 * 8, // 8 hours
  };
  return signPayload(payload);
}

/**
 * Verify that a request token is a valid signed admin session.
 * @param {string|null} token
 * @returns {boolean}
 */
export function verifyAdminToken(token) {
  const payload = verifySignedToken(token);
  return payload !== null && payload.role === 'admin';
}

/**
 * Generate a cryptographically signed token for an agent session.
 * @param {number|string} agentId
 * @returns {string}
 */
export function generateAgentToken(agentId) {
  const payload = {
    role: 'agent',
    id: agentId,
    iat: Date.now(),
    exp: Date.now() + 1000 * 60 * 60 * 8, // 8 hours
  };
  return signPayload(payload);
}

/**
 * Verify and decode a signed agent session token.
 * @param {string|null} token
 * @returns {{ id: number|string } | null}
 */
export function verifyAgentToken(token) {
  const payload = verifySignedToken(token);
  if (payload && payload.role === 'agent') {
    return { id: payload.id };
  }
  return null;
}


/**
 * Extract session cookie from a Next.js request.
 * @param {Request} request
 * @param {string} cookieName
 * @returns {string|null}
 */
export function getCookieFromRequest(request, cookieName) {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${cookieName}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Verify the API secret token for internal/admin API calls.
 * @param {Request} request
 * @returns {boolean}
 */
export function verifyApiSecret(request) {
  const headerToken = request.headers.get('x-api-secret');
  const adminToken  = getCookieFromRequest(request, 'admin_session');
  if (headerToken === API_SECRET) return true;
  if (verifyAdminToken(adminToken)) return true;
  return false;
}

/**
 * Create a Set-Cookie header value for admin session (HttpOnly + Secure).
 * @param {string} token
 * @returns {string}
 */
export function buildAdminCookieHeader(token) {
  const isProd = process.env.NODE_ENV === 'production';
  const parts = [
    `admin_session=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    'Max-Age=28800', // 8 hours
  ];
  if (isProd) parts.push('Secure');
  return parts.join('; ');
}

/**
 * Create a Set-Cookie header value for agent session (HttpOnly + Secure).
 * @param {string} token
 * @returns {string}
 */
export function buildAgentCookieHeader(token) {
  const isProd = process.env.NODE_ENV === 'production';
  const parts = [
    `agent_session=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    'Max-Age=28800', // 8 hours
  ];
  if (isProd) parts.push('Secure');
  return parts.join('; ');
}

/**
 * Cookie to clear admin session (logout).
 * @returns {string}
 */
export function buildClearAdminCookie() {
  return 'admin_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0';
}

/**
 * Cookie to clear agent session (logout).
 * @returns {string}
 */
export function buildClearAgentCookie() {
  return 'agent_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0';
}
