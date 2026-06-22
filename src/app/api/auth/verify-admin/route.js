import { NextResponse } from 'next/server';
import { getCookieFromRequest, verifyAdminToken } from '@/lib/auth';

/**
 * GET /api/auth/verify-admin
 * Verifies that the request has a valid admin session cookie.
 * Used by the admin layout to check authentication server-side.
 * Fixes [C-3]: client-side auth bypass
 */
export const dynamic = 'force-dynamic';
export async function GET(request) {
  const token = getCookieFromRequest(request, 'admin_session');
  const valid = verifyAdminToken(token);

  if (!valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
