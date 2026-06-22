// In-memory rate limiter — no Firebase, no external dependencies
// Works perfectly on Vercel serverless (per-instance memory)
const localAttempts = new Map();

/**
 * Extracts client IP securely.
 */
export function getClientIp(request) {
  if (request.ip) return request.ip;
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return '127.0.0.1';
}

/**
 * In-memory rate limiter — resets per serverless instance.
 * Sufficient for protection against brute-force within a single Vercel instance.
 *
 * @param {string} ip
 * @param {string} actionType
 * @param {number} maxAttempts
 * @param {number} windowMs
 * @returns {Promise<{ allowed: boolean, remaining?: number, retryAfter?: number }>}
 */
export async function checkRateLimit(ip, actionType, maxAttempts, windowMs) {
  const sanitizedIp = ip.replace(/[^a-zA-Z0-9_.-]/g, '_');
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
