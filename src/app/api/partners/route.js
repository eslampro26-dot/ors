import { NextResponse } from 'next/server';
import { getPartners, addPartner, updatePartner, deletePartner } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const partners = await getPartners();
    return NextResponse.json({ success: true, partners: partners || [] });
  } catch (err) {
    console.error('Error fetching partners:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch partners' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, partner, id } = body;

    if (action === 'delete') {
      if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
      const ok = await deletePartner(id);
      return NextResponse.json({ success: ok });
    }

    if (action === 'update') {
      if (!id || !partner) return NextResponse.json({ success: false, error: 'ID and partner data are required' }, { status: 400 });
      const ok = await updatePartner(id, partner);
      return NextResponse.json({ success: ok });
    }

    // Default action: add partner
    if (!partner || !partner.nameAr || !partner.nameEn) {
      return NextResponse.json({ success: false, error: 'Name in Arabic & English is required' }, { status: 400 });
    }

    const created = await addPartner(partner);
    return NextResponse.json({ success: true, partner: created });
  } catch (err) {
    console.error('Error handling partner request:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
