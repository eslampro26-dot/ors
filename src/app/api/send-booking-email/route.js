import { sendBookingEmailServer } from '@/lib/serverEmail';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const data = await request.json();
    const result = await sendBookingEmailServer(data);

    if (result.success) {
      return Response.json({ success: true, message: 'Emails dispatched successfully' });
    } else {
      return Response.json({ success: false, error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error('[send-booking-email] Unexpected error:', error);
    return Response.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
