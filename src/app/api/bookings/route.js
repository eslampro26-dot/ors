import { NextResponse } from 'next/server';
import { getBookings, addBooking, updateBookingStatus, deleteBooking } from '@/lib/db';
import { getCookieFromRequest, verifyAgentToken } from '@/lib/auth'

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

    // If an agent session cookie is present, attribute booking to that agent
    // Public customers (no cookie) are still allowed — only override agentId if not already set
    const token = getCookieFromRequest(request, 'agent_session');
    if (token) {
      const agentPayload = verifyAgentToken(token);
      if (agentPayload && !body.agentId) {
        body.agentId = agentPayload.id;
        body.agentName = agentPayload.name || body.agentName;
      }
    }

    if (!body.customer || !body.service) {
      return NextResponse.json({ error: 'بيانات الحجز ناقصة.' }, { status: 400 });
    }

    // Accept both number and string amounts
    const finalAmount = Number(body.finalAmount);
    if (isNaN(finalAmount) || finalAmount < 0) {
      return NextResponse.json({ error: 'قيمة الحجز غير صحيحة.' }, { status: 400 });
    }
    body.finalAmount = finalAmount;

    const result = await addBooking(body);
    if (!result) {
      return NextResponse.json({ error: 'Failed to add booking' }, { status: 500 });
    }
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    console.error('API Error adding booking:', e);
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
