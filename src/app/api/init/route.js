
import { NextResponse } from 'next/server';
import { initializeDB } from '@/lib/db.firebase';
import { verifyApiSecret } from '@/lib/auth';

/**
 * POST /api/init
 * Fixes [H-7]: DB init endpoint now requires admin authentication.
 * Previously open to anyone — could wipe the entire database.
 */
export async function POST(request) {
  // Require admin session or secret header
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
