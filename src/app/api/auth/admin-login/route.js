import { NextResponse } from 'next/server';
import { verifyAdminCredentials, generateAdminToken, buildAdminCookieHeader } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';

/**
 * POST /api/auth/admin-login
 * Server-side admin login — credentials never compared client-side.
 * Fixes: [C-1] Hardcoded admin password, [C-3] Client-side auth bypass,
 *         [H-1] Insecure cookies
 */

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(request) {
  try {
    // Rate limiting — get client IP
    const ip = getClientIp(request);

    const rateCheck = await checkRateLimit(ip, 'admin_login', MAX_ATTEMPTS, WINDOW_MS);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `تم تجاوز الحد الأقصى لمحاولات الدخول. يرجى الانتظار ${rateCheck.retryAfter} ثانية.` },
        {
          status: 429,
          headers: { 'Retry-After': String(rateCheck.retryAfter) },
        }
      );
    }

    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'الرجاء تعبئة جميع الحقول.' },
        { status: 400 }
      );
    }

    // Server-side credential verification (never in client JS)
    const isValid = verifyAdminCredentials(username, password);

    if (!isValid) {
      return NextResponse.json(
        { error: 'بيانات الدخول غير صحيحة.' },
        { status: 401 }
      );
    }

    // Generate a signed session token
    const token = generateAdminToken();

    // Set HttpOnly, Secure, SameSite cookie
    const response = NextResponse.json({ success: true });
    response.headers.set('Set-Cookie', buildAdminCookieHeader(token));
    return response;
  } catch (e) {
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تسجيل الدخول.' },
      { status: 500 }
    );
  }
}
