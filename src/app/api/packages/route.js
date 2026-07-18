import { NextResponse } from 'next/server';
import { getPackages, addPackage, deletePackage, updatePackage } from '@/lib/db';
import { verifyApiSecret } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const pkgId = searchParams.get('pkgId');

    if (pkgId) {
      const pkgs = await getPackages(pkgId);
      if (pkgs && pkgs.length > 0) {
        return NextResponse.json(pkgs);
      } else {
        return NextResponse.json({ error: 'لم يتم العثور على باقات لهذا النوع', data: [] }, { status: 404 });
      }
    }

    return NextResponse.json({ error: 'Missing pkgId' }, { status: 400 });
  } catch (e) {
    console.error('API Error fetching packages:', e);
    return NextResponse.json({ error: 'فشل جلب الباقات', data: [] }, { status: 500 });
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
      return NextResponse.json({ error: 'فشل إضافة الباقة' }, { status: 500 });
    }
    return NextResponse.json({ ...result, message: 'تمت إضافة الباقة بنجاح!' }, { status: 201 });
  } catch (e) {
    console.error('API Error adding package:', e);
    return NextResponse.json({ error: 'فشل إضافة الباقة' }, { status: 500 });
  }
}

export async function PUT(request) {
  if (!verifyApiSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { pkgId, id, ...packageData } = await request.json();
    if (!pkgId || !id) {
      return NextResponse.json({ error: 'Missing pkgId or id' }, { status: 400 });
    }
    const result = await updatePackage(pkgId, id, packageData);
    if (result) {
      return NextResponse.json({ success: true, message: 'تم تحديث الباقة بنجاح!' });
    } else {
      return NextResponse.json({ error: 'لم يتم العثور على الباقة أو فشل التحديث' }, { status: 404 });
    }
  } catch (e) {
    console.error('API Error updating package:', e);
    return NextResponse.json({ error: 'فشل تحديث الباقة' }, { status: 500 });
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
    if (result) {
      return NextResponse.json({ success: true, message: 'تم حذف الباقة بنجاح!' });
    } else {
      return NextResponse.json({ error: 'لم يتم العثور على الباقة أو فشل الحذف' }, { status: 404 });
    }
  } catch (e) {
    console.error('API Error deleting package:', e);
    return NextResponse.json({ error: 'فشل حذف الباقة' }, { status: 500 });
  }
}
