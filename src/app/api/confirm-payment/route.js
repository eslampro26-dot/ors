import { NextResponse } from 'next/server';
import { confirmBankPayment, rejectBankPayment, getBookings } from '@/lib/db';
import { getCookieFromRequest, verifyAdminToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    // Verify admin authorization
    const adminToken = getCookieFromRequest(request, 'admin_session');
    const isDev = process.env.NODE_ENV === 'development';
    
    if (!isDev && adminToken && !verifyAdminToken(adminToken)) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const body = await request.json();
    const { action, bookingId, adminNote, rejectionReason } = body;

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    if (action === 'confirm') {
      const result = await confirmBankPayment(bookingId, adminNote);
      if (!result) {
        return NextResponse.json({ error: 'Failed to confirm booking payment' }, { status: 500 });
      }

      // Try sending confirmation email to customer
      try {
        const allBookings = await getBookings();
        const booking = (allBookings || []).find(b => String(b.id) === String(bookingId));
        
        if (booking && booking.email) {
          const host = request.headers.get('host') || 'www.orluxus.com';
          const protocol = host.includes('localhost') ? 'http' : 'https';
          const origin = `${protocol}://${host}`;
          await fetch(`${origin}/api/send-booking-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customerName: booking.customer || booking.name || 'Valued Guest',
              email: booking.email,
              phone: booking.phone || '',
              whatsapp: booking.whatsapp || booking.phone || '',
              date: booking.date || new Date().toISOString().split('T')[0],
              travelers: booking.travelers || 1,
              children: booking.children || 0,
              infants: booking.infants || 0,
              serviceName: booking.service || 'ORLUXUS VIP Service',
              originalAmount: booking.originalAmount || booking.finalAmount || 0,
              discountAmount: booking.discountAmount || 0,
              finalAmount: booking.finalAmount || 0,
              paymentType: 'Direct Bank Transfer (Confirmed)',
              txId: booking.receiptTxRef || booking.id,
              extras: booking.extras || '',
              extrasDetails: booking.extrasDetails || [],
              pickupLocation: booking.pickupLocation || '',
              promoCode: booking.promoCode || '',
              agentName: booking.agentName || '',
              specialRequests: booking.specialRequests || [],
              adultPrice: booking.adultPrice,
              childPrice: booking.childPrice,
              infantPrice: booking.infantPrice
            })
          }).catch(e => console.warn('Email trigger warning:', e));
        }
      } catch (emailErr) {
        console.warn('Error triggering confirmation email:', emailErr);
      }

      return NextResponse.json({ success: true, message: 'Payment confirmed successfully' });
    } else if (action === 'reject') {
      const result = await rejectBankPayment(bookingId, rejectionReason);
      if (!result) {
        return NextResponse.json({ error: 'Failed to reject booking payment' }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: 'Payment rejected' });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (err) {
    console.error('Confirm payment API error:', err);
    return NextResponse.json({ error: 'Server error processing payment confirmation' }, { status: 500 });
  }
}