import { NextResponse } from 'next/server';
import { getBackupSnapshot, restoreBackupData } from '@/lib/backupService';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    let payloadToRestore = null;

    if (body.backupId) {
      // Restore by existing snapshot ID
      payloadToRestore = await getBackupSnapshot(body.backupId);
    } else if (body.uploadedPayload) {
      // Restore by uploaded file JSON payload
      payloadToRestore = body.uploadedPayload;
    } else {
      return NextResponse.json(
        { success: false, error: 'Missing backupId or uploadedPayload' },
        { status: 400 }
      );
    }

    const restoreResults = await restoreBackupData(payloadToRestore);
    return NextResponse.json({
      success: true,
      message: 'Backup restored successfully',
      results: restoreResults
    });
  } catch (error) {
    console.error('Error in POST /api/admin/backups/restore:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
