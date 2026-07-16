import { NextResponse } from 'next/server';
import { getBookings } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Public booking lookup by reference number.
 * No auth required — only returns safe fields (no internal IDs).
 * GET /api/booking-lookup?ref=CASH-TX-1784
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ref = (searchParams.get('ref') || '').trim().toUpperCase();

    if (!ref || ref.length < 4) {
      return NextResponse.json({ error: 'Please provide a valid booking reference.' }, { status: 400 });
    }

    const bookings = await getBookings();

    // Match by txId (case-insensitive partial or full match)
    const found = bookings.find(b => {
      const txId = (b.txId || b.id || '').toUpperCase();
      return txId === ref || txId.includes(ref) || ref.includes(txId.slice(0, 8));
    });

    if (!found) {
      return NextResponse.json({ error: 'No booking found with this reference number.' }, { status: 404 });
    }

    // Return only safe public fields
    return NextResponse.json({
      ref: (found.txId || found.id || '').toUpperCase(),
      customerName: found.customer?.name || '',
      service: found.service || '',
      date: found.date || '',
      travelers: found.travelers || 1,
      amount: found.finalAmount || 0,
      status: found.status || 'pending',
      paymentType: found.paymentType || '',
      agentName: found.agentName || '',
      pickup: found.pickupLocation || '',
      createdAt: found.createdAt || '',
    });
  } catch (e) {
    console.error('Booking lookup error:', e);
    return NextResponse.json({ error: 'Lookup failed. Please try again.' }, { status: 500 });
  }
}
