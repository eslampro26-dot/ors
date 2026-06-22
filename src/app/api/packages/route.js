import { NextResponse } from 'next/server';
import { getPackages, addPackage, deletePackage } from '@/lib/db';
import { verifyApiSecret } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const pkgId = searchParams.get('pkgId');

    if (pkgId) {
      const pkgs = await getPackages(pkgId);
      return NextResponse.json(pkgs || []);
    }

    return NextResponse.json({ error: 'Missing pkgId' }, { status: 400 });
  } catch (e) {
    console.error('API Error fetching packages:', e);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request) {
  if (!verifyApiSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { pkgId, ...packageData } = await request.json();
    if (!pkgId) {
      return NextResponse.json({ error: 'Missing pkgId' }, { status: 400 });
    }
    const result = await addPackage(pkgId, packageData);
    if (!result) {
      return NextResponse.json({ error: 'Failed to add package' }, { status: 500 });
    }
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    console.error('API Error adding package:', e);
    return NextResponse.json({ error: 'Failed to add package' }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!verifyApiSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { pkgId, id } = await request.json();
    if (!pkgId || !id) {
      return NextResponse.json({ error: 'Missing pkgId or id' }, { status: 400 });
    }
    const result = await deletePackage(pkgId, id);
    return NextResponse.json({ success: result });
  } catch (e) {
    console.error('API Error deleting package:', e);
    return NextResponse.json({ error: 'Failed to delete package' }, { status: 500 });
  }
}
