
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
      return NextResponse.json(trips);
    }

    return NextResponse.json({ error: 'Missing slug or category' }, { status: 400 });
  } catch (e) {
    console.error('API Error fetching trips:', e);
    return NextResponse.json([], { status: 500 });
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
      return NextResponse.json({ error: 'Failed to add trip' }, { status: 500 });
    }
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    console.error('API Error adding trip:', e);
    return NextResponse.json({ error: 'Failed to add trip' }, { status: 500 });
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
    return NextResponse.json({ success: result });
  } catch (e) {
    console.error('API Error updating trip:', e);
    return NextResponse.json({ error: 'Failed to update trip' }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!verifyApiSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing trip ID' }, { status: 400 });
    }
    const result = await deleteTrip(id);
    return NextResponse.json({ success: result });
  } catch (e) {
    console.error('API Error deleting trip:', e);
    return NextResponse.json({ error: 'Failed to delete trip' }, { status: 500 });
  }
}
