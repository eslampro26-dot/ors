
import { NextResponse } from 'next/server';
import { initializeDB } from '@/lib/db';
import { verifyApiSecret } from '@/lib/auth';

/**
 * GET /api/init
 * Public endpoint - seeds the database only if it's not already initialized.
 * Safe to call multiple times (idempotent).
 */
export async function GET() {
  try {
    await initializeDB();
    return NextResponse.json({ success: true, message: 'Database ready' });
  } catch (e) {
    console.error('Init error:', e);
    return NextResponse.json({ error: 'Failed to initialize database', details: e.message }, { status: 500 });
  }
}

/**
 * POST /api/init
 * Fixes [H-7]: DB init endpoint now requires admin authentication.
 */
export async function POST(request) {
  if (!verifyApiSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await initializeDB();
    return NextResponse.json({ success: true, message: 'Database initialized successfully' });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to initialize database' }, { status: 500 });
  }
}
