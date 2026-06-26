import { NextResponse } from 'next/server';
import { getTrips, addTrip, updateTrip, deleteTrip } from '@/lib/db';
import { verifyApiSecret } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const category = searchParams.get('category');

    if (slug && category) {
      const trips = await getTrips(slug, category);
      if (trips && trips.length > 0) {
        return NextResponse.json(trips);
      } else {
        return NextResponse.json({ error: 'لم يتم العثور على رحلات لهذا القسم', data: [] }, { status: 404 });
      }
    }

    return NextResponse.json({ error: 'Missing slug or category' }, { status: 400 });
  } catch (e) {
    console.error('API Error fetching trips:', e);
    return NextResponse.json({ error: 'فشل جلب الرحلات', data: [] }, { status: 500 });
  }
}

export async function POST(request) {
  if (!verifyApiSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { slug, category, ...tripData } = await request.json();
    if (!slug || !category) {
      return NextResponse.json({ error: 'Missing slug or category' }, { status: 400 });
    }
    const result = await addTrip(slug, category, tripData);
    if (!result) {
      return NextResponse.json({ error: 'فشل إضافة الرحلة' }, { status: 500 });
    }
    return NextResponse.json({ ...result, message: 'تمت إضافة الرحلة بنجاح!' }, { status: 201 });
  } catch (e) {
    console.error('API Error adding trip:', e);
    return NextResponse.json({ error: 'فشل إضافة الرحلة' }, { status: 500 });
  }
}

export async function PUT(request) {
  if (!verifyApiSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id, ...tripData } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing trip ID' }, { status: 400 });
    }
    const result = await updateTrip(id, tripData);
    if (result) {
      return NextResponse.json({ success: true, message: 'تم تحديث الرحلة بنجاح!' });
    } else {
      return NextResponse.json({ error: 'لم يتم العثور على الرحلة أو فشل التحديث' }, { status: 404 });
    }
  } catch (e) {
    console.error('API Error updating trip:', e);
    return NextResponse.json({ error: 'فشل تحديث الرحلة' }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!verifyApiSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { slug, category, id } = await request.json();
    if (!slug || !category || !id) {
      return NextResponse.json({ error: 'Missing slug, category, or trip ID' }, { status: 400 });
    }
    const result = await deleteTrip(slug, category, id);
    if (result) {
      return NextResponse.json({ success: true, message: 'تم حذف الرحلة بنجاح!' });
    } else {
      return NextResponse.json({ error: 'لم يتم العثور على الرحلة أو فشل الحذف' }, { status: 404 });
    }
  } catch (e) {
    console.error('API Error deleting trip:', e);
    return NextResponse.json({ error: 'فشل حذف الرحلة' }, { status: 500 });
  }
}
