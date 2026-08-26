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

    // Use currency from payment request, fallback to site currency
    const currency = paymentData.currency || siteCurrency || 'EGP';

    const candidateUrls = [
      paytabsApiUrl,
      'https://secure-egypt.paytabs.com/payment/request',
      'https://secure.paytabs.com/payment/request',
      'https://secure-global.paytabs.com/payment/request',
    ].filter((url, idx, self) => url && self.indexOf(url) === idx);

    const requestBody = {
      profile_id: cleanProfileId,
      tran_type: 'sale',
      tran_class: 'ecom',
      cart_id: paymentData.orderId || `BK-${Date.now()}`,
      cart_description: paymentData.productName || 'ORLUXUS Travel Excursion',
      cart_currency: currency,
      cart_amount: parseFloat(paymentData.amount) || 0,
      callback: paymentData.callbackUrl || `${request.nextUrl.origin}/api/paytabs/callback`,
      return: paymentData.successUrl || `${request.nextUrl.origin}/booking-confirmation`,
      return_auth: 'signed',
      customer_details: {
        name: paymentData.customerName || 'Valued Guest',
        email: paymentData.customerEmail || 'guest@orluxus.com',
        phone: paymentData.customerPhone || '+20100000000',
        street1: 'Touristic Area',
        city: paymentData.city || 'Sharm El Sheikh',
        state: 'South Sinai',
        country: 'EG',
        zip: '46619'
      },
      shipping_details: {
        name: paymentData.customerName || 'Valued Guest',
        email: paymentData.customerEmail || 'guest@orluxus.com',
        phone: paymentData.customerPhone || '+20100000000',
        street1: 'Touristic Area',
        city: paymentData.city || 'Sharm El Sheikh',
        state: 'South Sinai',
        country: 'EG',
        zip: '46619'
      },
      frame: false,
      hide_shipping: true,
      language: paymentData.language || 'en'
    };

    let lastError = null;
    let successfulResult = null;

    for (const targetUrl of candidateUrls) {
      try {
        const response = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': cleanServerKey
          },
          body: JSON.stringify(requestBody)
        });

        const result = await response.json();
        const payUrl = result?.redirect_url || result?.paypage_url;

        if (payUrl) {
          successfulResult = {
            success: true,
            paymentUrl: payUrl,
            tranRef: result.tran_ref,
            usedEndpoint: targetUrl
          };
          break;
        } else {
          lastError = result?.message || result?.error || 'Endpoint failed';
          console.error(`PayTabs endpoint ${targetUrl} failed:`, result);
        }
      } catch (err) {
        lastError = err.message;
        console.error(`PayTabs endpoint ${targetUrl} threw:`, err.message);
      }
    }

    if (successfulResult) {
      return NextResponse.json(successfulResult);
    } else {
      return NextResponse.json({ 
        success: false, 
        error: lastError || 'Failed to authenticate with PayTabs servers.' 
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
