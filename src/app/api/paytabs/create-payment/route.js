import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(request) {
  try {
    const paymentData = await request.json();
    const settings = await getSettings();

    const profileId = settings?.paytabsProfileId || '';
    const serverKey = settings?.paytabsServerKey || '';
    const paytabsApiUrl = settings?.paytabsApiUrl || 'https://secure.paytabs.com/payment/request';
    const paytabsEnabled = settings?.paytabsEnabled === true || settings?.paytabsEnabled === 'true';

    if (!paytabsEnabled) {
      return NextResponse.json({ 
        success: false, 
        error: 'Paytabs payment gateway is currently disabled in Admin Settings' 
      }, { status: 400 });
    }

    if (!profileId || !serverKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'Paytabs credentials (Profile ID / Server Key) are not configured yet in Admin Settings' 
      }, { status: 400 });
    }

    const requestBody = {
      profile_id: profileId,
      tran_type: 'sale',
      tran_class: 'ecom',
      cart_id: paymentData.orderId || `BK-${Date.now()}`,
      cart_description: paymentData.productName || 'Travel Booking Excursion',
      cart_currency: paymentData.currency || 'EUR',
      cart_amount: parseFloat(paymentData.amount) || 0,
      callback: paymentData.callbackUrl || `${request.nextUrl.origin}/api/paytabs/callback`,
      return: paymentData.successUrl || `${request.nextUrl.origin}/booking-confirmation`,
      return_auth: 'signed',
      customer_details: {
        name: paymentData.customerName || 'Valued Guest',
        email: paymentData.customerEmail || 'info@orluxus.com',
        phone: paymentData.customerPhone || '+20100000000',
        street1: '',
        city: paymentData.city || 'Sharm El Sheikh',
        state: '',
        country: 'EG',
        zip: ''
      },
      shipping_details: {
        name: paymentData.customerName || 'Valued Guest',
        email: paymentData.customerEmail || 'info@orluxus.com',
        phone: paymentData.customerPhone || '+20100000000',
        street1: '',
        city: paymentData.city || 'Sharm El Sheikh',
        state: '',
        country: 'EG',
        zip: ''
      },
      frame: false,
      hide_shipping: true,
      language: paymentData.language || 'en'
    };

    const response = await fetch(paytabsApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': serverKey
      },
      body: JSON.stringify(requestBody)
    });

    const result = await response.json();

    if (result.paypage_url) {
      return NextResponse.json({ 
        success: true, 
        paymentUrl: result.paypage_url, 
        tranRef: result.tran_ref 
      });
    } else {
      console.error('Paytabs API response error:', result);
      return NextResponse.json({ 
        success: false, 
        error: result.message || 'Failed to create Paytabs payment page' 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Server error creating Paytabs payment:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Server error creating payment' 
    }, { status: 500 });
  }
}
