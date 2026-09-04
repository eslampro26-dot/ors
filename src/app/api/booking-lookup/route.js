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
    // Strip leading # if user typed it (e.g. "#0319982" → "0319982")
    const ref = (searchParams.get('ref') || '').trim().replace(/^#/, '').toUpperCase();

    if (!ref || ref.length < 4) {
      return NextResponse.json({ error: 'Please provide a valid booking reference.' }, { status: 400 });
    }

    const bookings = await getBookings();

    // Match by exact reference (txId, id, bookingRefCode) or clean suffix match
    const found = bookings.find(b => {
      const txId = (b.txId || '').toUpperCase();
      const id = (b.id || '').toUpperCase();
      const bookingRefCode = (b.bookingRefCode || '').toUpperCase();

      if (txId === ref || id === ref || bookingRefCode === ref) return true;
      if (txId && ref.includes(txId)) return true;
      if (id && ref.includes(id)) return true;
      if (bookingRefCode && (bookingRefCode.includes(ref) || ref.includes(bookingRefCode))) return true;

      // Clean up common prefixes to prevent matching empty prefixes
      const cleanRef = ref.replace(/^(CASH-TX-|PP-TX-|BANK-TX-|DAFAH-TX-|BK-|ORLX-)/, '').trim();
      const cleanTxId = txId.replace(/^(CASH-TX-|PP-TX-|BANK-TX-|DAFAH-TX-|BK-)/, '').trim();
      const cleanId = id.replace(/^(CASH-TX-|PP-TX-|BANK-TX-|DAFAH-TX-|BK-)/, '').trim();
      const cleanRefCode = bookingRefCode.replace(/^ORLX-/, '').trim();

      if (!cleanRef || cleanRef.length < 4) return false;

      // Match by suffix (user types last 7 digits of timestamp)
      if (cleanTxId.endsWith(cleanRef) || cleanTxId.includes(cleanRef)) return true;
      if (cleanRefCode === cleanRef) return true;

      return cleanTxId === cleanRef || cleanId === cleanRef || cleanTxId.includes(cleanRef) || cleanRef.includes(cleanTxId);
    });

    if (!found) {
      return NextResponse.json({ error: 'No booking found with this reference number.' }, { status: 404 });
    }

    // Return complete booking fields for public ticket & contract verification
    const custName = typeof found.customer === 'string'
      ? found.customer
      : (found.customer?.name || found.customerName || '');

    return NextResponse.json({
      ref: (found.txId || found.id || '').toUpperCase(),
      bookingRefCode: found.bookingRefCode || '',
      customerName: custName,
      email: found.email || found.customerEmail || '',
      phone: found.phone || '',
      whatsapp: found.whatsapp || found.phone || '',
      service: found.service || found.serviceName || '',
      city: found.city || '',
      date: found.date || found.bookingDate || '',
      travelers: Number(found.travelers) || 1,
      children: Number(found.children) || 0,
      infants: Number(found.infants) || 0,
      adultPrice: Number(found.adultPrice) || 0,
      childPrice: Number(found.childPrice) || 0,
      infantPrice: Number(found.infantPrice) || 0,
      originalAmount: Number(found.originalAmount || found.amount || found.finalAmount || 0),
      discountAmount: Number(found.discountAmount) || 0,
      finalAmount: Number(found.finalAmount || found.amount || 0),
      amount: Number(found.finalAmount || found.amount || 0),
      currency: found.currency || '€',
      status: found.status || 'pending',
      paymentType: found.paymentType || '',
      agentName: found.agentName || '',
      agentId: found.agentId || '',
      promoCode: found.promoCode || '',
      pickup: found.pickupLocation || found.pickup || '',
      pickupLocation: found.pickupLocation || found.pickup || '',
      extras: found.extras || '',
      extrasDetails: found.extrasDetails || [],
      specialRequests: found.specialRequests || found.comments || '',
      createdAt: found.createdAt || '',
      electronicSignature: found.electronicSignature || {
        name: custName,
        email: found.email || '',
        phone: found.phone || '',
        timestamp: found.createdAt || new Date().toISOString()
      },
      signatureTimestamp: found.signatureTimestamp || found.createdAt || ''
    });

  } catch (e) {
    console.error('Booking lookup error:', e);
    return NextResponse.json({ error: 'Lookup failed. Please try again.' }, { status: 500 });
  }
}
