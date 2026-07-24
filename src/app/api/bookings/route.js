import { NextResponse } from 'next/server';
import { getBookings, addBooking, updateBookingStatus, deleteBooking } from '@/lib/db';
import { verifyApiSecret, getCookieFromRequest, verifyAgentToken } from '@/lib/auth';

function isAdmin(request) {
  return verifyApiSecret(request);
}

function isAgent(request) {
  const token = getCookieFromRequest(request, 'agent_session');
  return verifyAgentToken(token) !== null;
}

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const bookings = await getBookings();
    return NextResponse.json(bookings);
  } catch (e) {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const isUserAdmin = isAdmin(request);
    let sessionAgentId = null;
    
    if (!isUserAdmin) {
      const token = getCookieFromRequest(request, 'agent_session');
      const agentPayload = verifyAgentToken(token);
      if (!agentPayload) {
        return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
      }
      sessionAgentId = agentPayload.id;
      body.agentId = sessionAgentId;
    }

    if (!body.customer || !body.service) {
      return NextResponse.json({ error: 'بيانات الحجز ناقصة.' }, { status: 400 });
    }
    if (typeof body.finalAmount !== 'number' || body.finalAmount < 0) {
      return NextResponse.json({ error: 'قيمة الحجز غير صحيحة.' }, { status: 400 });
    }
    const result = await addBooking(body);
    if (!result) {
      return NextResponse.json({ error: 'Failed to add booking' }, { status: 500 });
    }
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to add booking' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, status } = await request.json();
    if (!id || !status) return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    const result = await updateBookingStatus(id, status);
    return NextResponse.json({ success: !!result });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const result = await deleteBooking(id);
    return NextResponse.json({ success: !!result });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
  }
}
