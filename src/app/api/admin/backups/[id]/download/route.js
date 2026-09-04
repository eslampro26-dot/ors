import { NextResponse } from 'next/server';
import { getBackupSnapshot } from '@/lib/backupService';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Missing backup ID' }, { status: 400 });
    }

    const snapshot = await getBackupSnapshot(id);
    const jsonString = JSON.stringify(snapshot, null, 2);

    return new Response(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="' + (snapshot.filename || (id + '.json')) + '"'
      }
    });
  } catch (error) {
    console.error('Error in backup download:', error);
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}
