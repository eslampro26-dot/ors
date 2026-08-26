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
    const paytabsApiUrl = settings?.paytabsApiUrl || 'https://secure-egypt.paytabs.com/payment/request';
    const paytabsEnabled = settings?.paytabsEnabled === true || settings?.paytabsEnabled === 'true';
    const siteCurrency = settings?.currency || 'EGP';

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

    const cleanProfileId = String(profileId).trim();
    const cleanServerKey = String(serverKey).trim();

    // Primary endpoint: Egypt
    const primaryUrl = paytabsApiUrl || 'https://secure-egypt.paytabs.com/payment/request';
    
    // Requested currency and amount
    const rawCurrency = paymentData.currency || (siteCurrency.includes('EGP') ? 'EGP' : (siteCurrency.includes('USD') ? 'USD' : 'EUR'));
    const rawAmount = parseFloat(paymentData.amount) || 0;

    const buildPayload = (curr, amt) => ({
      profile_id: cleanProfileId,
      tran_type: 'sale',
      tran_class: 'ecom',
      cart_id: paymentData.orderId || `BK-${Date.now()}`,
      cart_description: paymentData.productName || 'ORLUXUS Travel Excursion',
      cart_currency: curr,
      cart_amount: amt,
      callback: paymentData.callbackUrl || `${request.nextUrl.origin}/api/paytabs/callback`,
      return: paymentData.successUrl || `${request.nextUrl.origin}/booking-confirmation`,
      return_auth: 'signed',
      customer_details: {
        name: paymentData.customerName || 'Valued Guest',
        email: paymentData.customerEmail || 'guest@orluxus.com',
        phone: paymentData.customerPhone || '+20100000000',
        street1: 'Touristic Area',
        city: paymentData.city || 'Cairo',
        state: 'Cairo',
        country: 'EG',
        zip: '11511'
      },
      shipping_details: {
        name: paymentData.customerName || 'Valued Guest',
        email: paymentData.customerEmail || 'guest@orluxus.com',
        phone: paymentData.customerPhone || '+20100000000',
        street1: 'Touristic Area',
        city: paymentData.city || 'Cairo',
        state: 'Cairo',
        country: 'EG',
        zip: '11511'
      },
      frame: false,
      hide_shipping: true,
      language: paymentData.language || 'en'
    });

    // 1. First Attempt: Try with requested currency
    let response = await fetch(primaryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': cleanServerKey
      },
      body: JSON.stringify(buildPayload(rawCurrency, rawAmount))
    });

    let result = await response.json();
    let payUrl = result?.redirect_url || result?.paypage_url;

    // 2. If rejected due to currency (e.g. Test profile only supports EGP), fallback to EGP
    if (!payUrl && (result?.message?.includes('Currency') || result?.code === 206 || result?.message?.includes('currency'))) {
      console.log(`PayTabs rejected ${rawCurrency}, attempting fallback to EGP...`);
      // Approximate conversion if amount was in EUR or USD (approx 52 EGP per EUR/USD)
      const convertedAmount = rawCurrency === 'EGP' ? rawAmount : Math.round(rawAmount * 52);
      
      response = await fetch(primaryUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': cleanServerKey
        },
        body: JSON.stringify(buildPayload('EGP', convertedAmount))
      });

      result = await response.json();
      payUrl = result?.redirect_url || result?.paypage_url;
    }

    if (payUrl) {
      return NextResponse.json({
        success: true,
        paymentUrl: payUrl,
        tranRef: result.tran_ref,
        usedEndpoint: primaryUrl
      });
    } else {
      console.error('PayTabs creation failed:', result);
      return NextResponse.json({ 
        success: false, 
        error: result?.message || result?.error || 'PayTabs error creating payment session'
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
