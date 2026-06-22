
import { NextResponse } from 'next/server';
import { getBookings, addBooking, updateBookingStatus, deleteBooking } from '@/lib/db';
import { verifyApiSecret, getCookieFromRequest, verifyAgentToken } from '@/lib/auth';

/**
 * Fixes [C-4]: Bookings API now requires authentication.
 * GET/PUT/DELETE require admin session.
 * POST (add booking) is allowed for authenticated agents too.
 */

function isAdmin(request) {
  return verifyApiSecret(request);
}

function isAgent(request) {
  const token = getCookieFromRequest(request, 'agent_session');
  return verifyAgentToken(token) !== null;
}

export const dynamic = 'force-dynamic';
export async function GET(request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const bookings = await getBookings();
    return NextResponse.json(bookings);
  } catch (e) {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request) {
  // Booking creation allowed for both admin and authenticated agents
  if (!isAdmin(request) && !isAgent(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    
    // Prevent IDOR: Force agentId to match the authenticated session
    const isUserAdmin = isAdmin(request);
    let sessionAgentId = null;
    
    if (!isUserAdmin) {
      const token = getCookieFromRequest(request, 'agent_session');
      const agentPayload = verifyAgentToken(token);
      if (!agentPayload) {
        return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
      }
      sessionAgentId = agentPayload.id;
      
      // Override any provided agentId with the true session agentId
      body.agentId = sessionAgentId;
    }

    // Basic input validation
    if (!body.customer || !body.service) {
      return NextResponse.json({ error: 'بيانات الحجز ناقصة.' }, { status: 400 });
    }
    // Validate amount is a positive number
    // To prevent total tampering, backend should ideally fetch package price and recalculate.
    // For now, at least ensure it's a number and >= 0.
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
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id, status } = await request.json();
    if (!id || !status) return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    const result = await updateBookingStatus(id, status);
    return NextResponse.json({ success: result });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const result = await deleteBooking(id);
    return NextResponse.json({ success: result });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
  }
}
