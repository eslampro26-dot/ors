import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

// In-memory fallback
const localAttempts = new Map();

/**
 * Extracts client IP securely.
 * Ignores user-provided X-Forwarded-For to prevent IP spoofing attacks.
 * Relies on the trusted proxy header (x-real-ip) or platform-specific IP.
 */
export function getClientIp(request) {
  // 1. Try Next.js internal IP if available (Vercel edge, Next.js >= 13)
  if (request.ip) return request.ip;
  
  // 2. Try trusted proxy header (X-Real-IP) set by Nginx/Vercel
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;

  // 3. Fallback (Do NOT use X-Forwarded-For directly as it can be spoofed by clients)
  return '127.0.0.1';
}

// Timeout helper for Firebase Firestore operations
async function withTimeout(promise, timeoutMs = 2000) {
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

/**
 * Checks and records rate limits.
 * Uses Firestore if configured, otherwise falls back to in-memory Map.
 * 
 * @param {string} ip - Client IP
 * @param {string} actionType - E.g., 'admin_login', 'agent_login', 'reviews', 'promo_codes_validate'
 * @param {number} maxAttempts - Max allowed attempts within the window
 * @param {number} windowMs - Window duration in milliseconds
 * @returns {Promise<{ allowed: boolean, remaining?: number, retryAfter?: number }>}
 */
export async function checkRateLimit(ip, actionType, maxAttempts, windowMs) {
  const isFirebaseConfigured = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && 
                               process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== 'orluxus-demo';
  
  const sanitizedIp = ip.replace(/[^a-zA-Z0-9_.-]/g, '_');

  if (isFirebaseConfigured) {
    try {
      const docRef = doc(db, 'rate_limits', `${sanitizedIp}_${actionType}`);
      const snap = await withTimeout(getDoc(docRef), 2000);
      const now = Date.now();
      
      if (!snap.exists()) {
        await withTimeout(setDoc(docRef, { count: 1, resetAt: now + windowMs }), 2000);
        return { allowed: true, remaining: maxAttempts - 1 };
      }
      
      const data = snap.data();
      
      if (now > data.resetAt) {
        // Reset window
        await withTimeout(setDoc(docRef, { count: 1, resetAt: now + windowMs }), 2000);
        return { allowed: true, remaining: maxAttempts - 1 };
      }
      
      if (data.count >= maxAttempts) {
        const retryAfter = Math.ceil((data.resetAt - now) / 1000);
        return { allowed: false, retryAfter };
      }
      
      await withTimeout(updateDoc(docRef, { count: data.count + 1 }), 2000);
      return { allowed: true, remaining: maxAttempts - (data.count + 1) };
    } catch (e) {
      console.error('Firestore rate limiting failed, falling back to local memory:', e);
      // Fall through to in-memory Map
    }
  }

  // Fallback in-memory rate limiter
  const key = `${sanitizedIp}_${actionType}`;
  const now = Date.now();
  const record = localAttempts.get(key);

  if (!record || now > record.resetAt) {
    localAttempts.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  if (record.count >= maxAttempts) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  record.count += 1;
  return { allowed: true, remaining: maxAttempts - record.count };
}
