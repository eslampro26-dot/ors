import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/db';
import { calculateEgpSettlement } from '@/lib/currency';

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
    const primaryUrl = paytabsApiUrl || 'https://secure-egypt.paytabs.com/payment/request';

    // 1. Currency Conversion & Strict EGP Settlement Enforcement
    // Egyptian banking regulations strictly require EGP settlement for PayTabs Egypt
    const incomingCurrency = (paymentData.originalCurrency || paymentData.currency || 'EGP').toUpperCase();
    const incomingAmount = parseFloat(paymentData.originalAmount || paymentData.amount) || 0;

    let finalEgpAmount = 0;
    let appliedRate = 1.0;

    if (paymentData.finalEgpAmount && Number(paymentData.finalEgpAmount) > 0) {
      // Amount already pre-converted by frontend exchange rate engine
      finalEgpAmount = Math.round(Number(paymentData.finalEgpAmount));
      appliedRate = Number(paymentData.appliedExchangeRate) || 1.0;
    } else if (incomingCurrency === 'EGP') {
      finalEgpAmount = Math.round(incomingAmount);
      appliedRate = 1.0;
    } else {
      // Convert foreign currency to EGP using central bank rates
      const settlement = calculateEgpSettlement(incomingAmount, incomingCurrency);
      finalEgpAmount = settlement.egpAmount;
      appliedRate = settlement.appliedRate;
    }

    // 2. Audit Trail Description
    const baseDesc = paymentData.productName || 'ORLUXUS Travel Excursion';
    const auditDescription = incomingCurrency === 'EGP'
      ? `${baseDesc} - ${finalEgpAmount} EGP`
      : `${baseDesc} - Original: ${incomingAmount} ${incomingCurrency} (Rate: ${appliedRate})`;

    // 3. Build PayTabs Payload strictly in EGP
    const payload = {
      profile_id: cleanProfileId,
      tran_type: 'sale',
      tran_class: 'ecom',
      cart_id: paymentData.orderId || `BK-${Date.now()}`,
      cart_description: auditDescription.slice(0, 250),
      cart_currency: 'EGP', // Strictly EGP for Egypt compliance
      cart_amount: finalEgpAmount,
      tran_currency: 'EGP',
      tran_total: finalEgpAmount,
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
      user_defined: {
        udf1: incomingCurrency,
        udf2: String(incomingAmount),
        udf3: String(appliedRate),
        udf4: String(finalEgpAmount),
        udf5: 'ORLUXUS-MultiCurrency'
      },
      frame: false,
      hide_shipping: true,
      language: paymentData.language || 'en'
    };

    // 4. Send request to PayTabs Egypt endpoint
    const response = await fetch(primaryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': cleanServerKey
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    const payUrl = result?.redirect_url || result?.paypage_url;

    if (payUrl) {
      return NextResponse.json({
        success: true,
        paymentUrl: payUrl,
        tranRef: result.tran_ref,
        settlementCurrency: 'EGP',
        settlementAmount: finalEgpAmount,
        originalAmount: incomingAmount,
        originalCurrency: incomingCurrency,
        appliedRate
      });
    } else {
      console.error('PayTabs creation failed with response:', result);
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
