import { NextResponse } from 'next/server';
import {
  listBackups,
  createBackupSnapshot,
  deleteBackupSnapshot,
  checkAndRunDailyAutoBackup
} from '@/lib/backupService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Automatically trigger daily check on panel visit
    await checkAndRunDailyAutoBackup().catch(err => {
      console.warn('Auto backup check notice:', err?.message);
    });

    const backups = await listBackups().catch(err => {
      console.warn('listBackups fallback to empty:', err?.message);
      return [];
    });
    return NextResponse.json({ success: true, backups: backups || [] });
  } catch (error) {
    console.error('Error in GET /api/admin/backups:', error);
    return NextResponse.json({ success: false, error: error.message, backups: [] }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const triggerType = body.triggerType || 'manual';
    const note = body.note || '';

    const newBackup = await createBackupSnapshot(triggerType, note);
    return NextResponse.json({ success: true, backup: newBackup });
  } catch (error) {
    console.error('Error in POST /api/admin/backups:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Backup ID is required' }, { status: 400 });
    }

    await deleteBackupSnapshot(id);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('Error in DELETE /api/admin/backups:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
