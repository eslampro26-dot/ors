import { NextResponse } from 'next/server';

/**
 * ORLUXUS Next.js Edge Middleware
 * 
 * 1. Admin Route Protection:
 *    - Protects /orluxus-management/* (redirects unauthorized to /orluxus-management/login)
 *    - Protects /api/admin/* (returns 401 Unauthorized for unauthorized requests)
 *    - Redirects authenticated admins away from /orluxus-management/login to /orluxus-management
 * 
 * 2. Security Headers & Strict CSP (A+ Rating):
 *    - Generates per-request cryptographic nonce using Web Crypto API
 *    - Strict Content-Security-Policy with 'strict-dynamic' and nonce
 *    - Full support for Firebase, PayTabs, PayPal, Google Fonts, and Google Analytics
 *    - HSTS (Strict-Transport-Security), X-Frame-Options, X-Content-Type-Options
 */

const API_SECRET = process.env.API_SECRET_TOKEN || 'ORLUXUS_SECURE_API_SECRET_KEY_PROD_2026_STABLE';

// Convert base64url string to Uint8Array (Web Standards / Edge Runtime)
function base64UrlToUint8Array(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Cryptographically verify admin token using Web Crypto API (HMAC-SHA256)
async function verifyAdminSessionToken(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [base64Payload, signature] = parts;

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(API_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const sigBytes = base64UrlToUint8Array(signature);
    const dataBytes = encoder.encode(base64Payload);
    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, dataBytes);
    if (!isValid) return false;

    // Decode and validate payload contents and expiration
    const jsonStr = atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(jsonStr);

    if (!payload || payload.role !== 'admin') return false;
    if (typeof payload.exp === 'number' && Date.now() > payload.exp) return false;

    return true;
  } catch {
    return false;
  }
}

// External services whitelist for CSP
const CSP_CONFIG = {
  defaultSrc: ["'self'"],
  scriptSrc: [
    "'self'",
    "https://www.paypal.com",
    "https://www.paypalobjects.com",
    "https://apis.google.com",
    "https://secure.paytabs.com",
    "https://*.paytabs.com",
    "https://*.googletagmanager.com",
    "https://*.google-analytics.com",
    "https://*.analytics.google.com",
    "https://accounts.google.com",
  ],
  styleSrc: [
    "'self'",
    "'unsafe-inline'", // Required for emotion / styled-jsx / CSS modules in Next.js
    "https://fonts.googleapis.com",
  ],
  fontSrc: [
    "'self'",
    "https://fonts.gstatic.com",
    "data:",
  ],
  imgSrc: [
    "'self'",
    "data:",
    "blob:",
    "https://images.unsplash.com",
    "https://plus.unsplash.com",
    "https://res.cloudinary.com",
    "https://*.googleusercontent.com",
    "https://firebasestorage.googleapis.com",
    "https://*.firebasestorage.app",
    "https://www.google.com",
    "https://*.google.com",
    "https://secure.paytabs.com",
    "https://*.paytabs.com",
    "https://www.paypalobjects.com",
  ],
  mediaSrc: [
    "'self'",
    "https://assets.mixkit.co",
    "data:",
    "blob:",
  ],
  connectSrc: [
    "'self'",
    "https://*.firebaseio.com",
    "https://*.googleapis.com",
    "https://*.firebasestorage.app",
    "https://www.paypal.com",
    "https://firestore.googleapis.com",
    "https://*.firestore.googleapis.com",
    "https://*.firebaseapp.com",
    "https://identitytoolkit.googleapis.com",
    "https://securetoken.googleapis.com",
    "https://secure.paytabs.com",
    "https://*.paytabs.com",
    "https://*.googletagmanager.com",
    "https://*.google-analytics.com",
    "https://*.analytics.google.com",
  ],
  frameSrc: [
    "'self'",
    "https://www.paypal.com",
    "https://secure.paytabs.com",
    "https://*.paytabs.com",
    "https://orluxus.firebaseapp.com",
    "https://*.firebaseapp.com",
    "https://*.youtube.com",
    "https://*.youtube-nocookie.com",
    "https://player.vimeo.com",
    "https://*.vimeo.com",
    "https://accounts.google.com",
  ],
  formAction: [
    "'self'",
    "https://secure.paytabs.com",
    "https://*.paytabs.com",
    "https://www.paypal.com",
  ],
};

function generateCsp(nonce) {
  const scriptSources = [
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    "'unsafe-inline'",
    ...CSP_CONFIG.scriptSrc,
  ].join(' ');

  return [
    `default-src ${CSP_CONFIG.defaultSrc.join(' ')}`,
    `script-src ${scriptSources}`,
    `style-src ${CSP_CONFIG.styleSrc.join(' ')}`,
    `font-src ${CSP_CONFIG.fontSrc.join(' ')}`,
    `img-src ${CSP_CONFIG.imgSrc.join(' ')}`,
    `media-src ${CSP_CONFIG.mediaSrc.join(' ')}`,
    `connect-src ${CSP_CONFIG.connectSrc.join(' ')}`,
    `frame-src ${CSP_CONFIG.frameSrc.join(' ')}`,
    `form-action ${CSP_CONFIG.formAction.join(' ')}`,
    "object-src 'none'",
    "base-uri 'self'",
    "upgrade-insecure-requests",
  ].join('; ');
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // ─── 1. Admin Authentication Protection ───
  const adminCookie = request.cookies.get('admin_session')?.value;
  const isAuthorizedAdmin = await verifyAdminSessionToken(adminCookie);

  // If already authenticated and visiting /orluxus-management/login -> redirect to /orluxus-management
  if (pathname === '/orluxus-management/login') {
    if (isAuthorizedAdmin) {
      return NextResponse.redirect(new URL('/orluxus-management', request.url));
    }
  }

  // Protect Admin Dashboard Routes (/orluxus-management/*)
  if (pathname.startsWith('/orluxus-management') && pathname !== '/orluxus-management/login') {
    if (!isAuthorizedAdmin) {
      const loginUrl = new URL('/orluxus-management/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect Admin API Routes (/api/admin/*)
  if (pathname.startsWith('/api/admin')) {
    if (!isAuthorizedAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin authentication required.' },
        { status: 401 }
      );
    }
  }

  // ─── 2. Nonce Generation & Strict Security Headers ───
  const nonce = btoa(crypto.randomUUID()).replace(/=/g, '');
  const cspHeader = generateCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspHeader);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Strict security headers for A+ rating on SecurityHeaders & PageSpeed Insights
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - Static image and media assets (.png, .jpg, .svg, .webp, .avif, .ico)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff|woff2)$).*)',
  ],
};
