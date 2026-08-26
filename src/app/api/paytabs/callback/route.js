import { verifyPaytabsPayment } from '@/lib/paytabs';
import { updateBookingStatus, getBookings } from '@/lib/db';
import { sendBookingEmailServer } from '@/lib/serverEmail';

export async function POST(request) {
  try {
    const callbackData = await request.json();
    
    // Verify the payment with Paytabs
    const verification = await verifyPaytabsPayment(callbackData);
    
    if (!verification.success) {
      return Response.json({ error: 'Payment verification failed' }, { status: 400 });
    }
    
    if (verification.paid) {
      const tranRef = callbackData.tran_ref;
      const cartId = callbackData.cart_id;
      const bookingId = cartId || tranRef;
      
      // 1. Update booking status to Confirmed in database
      await updateBookingStatus(bookingId, 'Confirmed');
      
      // 2. Fetch full booking details to dispatch confirmed ticket email
      try {
        const allBookings = await getBookings();
        const matchedBooking = (allBookings || []).find(b => 
          b.id === bookingId || 
          b.id === cartId || 
          b.txId === tranRef ||
          (b.id && cartId && b.id.includes(cartId))
        );

        if (matchedBooking && matchedBooking.email) {
          console.log('[PayTabs Callback] Dispatching automatic confirmed email ticket to guest:', matchedBooking.email);
          await sendBookingEmailServer({
            ...matchedBooking,
            status: 'Confirmed',
            paymentType: 'paytabs',
            txId: tranRef || matchedBooking.txId,
            serviceName: matchedBooking.service || matchedBooking.serviceName,
            customerName: matchedBooking.customer || matchedBooking.customerName,
            finalAmount: verification.amount || matchedBooking.finalAmount
          });
        }
      } catch (emailErr) {
        console.error('[PayTabs Callback] Failed to dispatch automatic email ticket:', emailErr);
      }
      
      return Response.json({ 
        success: true, 
        paid: true, 
        amount: verification.amount,
        currency: verification.currency,
        tranRef: verification.tranRef
      });
    } else {
      return Response.json({ 
        success: true, 
        paid: false, 
        status: verification.status 
      });
    }
  } catch (error) {
    console.error('Paytabs callback error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
