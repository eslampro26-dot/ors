import { NextResponse } from 'next/server';
import { buildClearAdminCookie, buildClearAgentCookie } from '@/lib/auth';

/**
 * POST /api/auth/logout
 * Clears admin and agent session cookies.
 */
export async function POST() {
  const response = NextResponse.json({ success: true });
  response.headers.append('Set-Cookie', buildClearAdminCookie());
  response.headers.append('Set-Cookie', buildClearAgentCookie());
  return response;
}
