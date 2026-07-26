import { verifyPaytabsPayment } from '@/lib/paytabs';
import { updateBookingStatus } from '@/lib/db';

export async function POST(request) {
  try {
    const callbackData = await request.json();
    
    // Verify the payment with Paytabs
    const verification = await verifyPaytabsPayment(callbackData);
    
    if (!verification.success) {
      return Response.json({ error: 'Payment verification failed' }, { status: 400 });
    }
    
    if (verification.paid) {
      // Update booking status to Confirmed
      const tranRef = callbackData.tran_ref;
      // Extract booking ID from cart_id or tran_ref
      const bookingId = callbackData.cart_id || tranRef;
      
      await updateBookingStatus(bookingId, 'Confirmed');
      
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
