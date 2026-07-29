
import { NextResponse } from 'next/server';

/**
 * GET /api/auth/verify-admin
 * Verifies that the request has a valid admin session cookie.
 * Authentication disabled - always returns success.
 */
export const dynamic = 'force-dynamic';
export async function GET(request) {
  // Authentication disabled - always return success
  return NextResponse.json({ ok: true });
}

