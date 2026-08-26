import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(request) {
  try {
    const { profileId, serverKey, apiUrl } = await request.json();

    if (!profileId || !serverKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'Profile ID and Server Key are required for testing' 
      }, { status: 400 });
    }

    const cleanProfileId = String(profileId).trim();
    const cleanServerKey = String(serverKey).trim();

    const candidateUrls = [
      apiUrl,
      'https://secure-egypt.paytabs.com/payment/request',
      'https://secure.paytabs.com/payment/request',
      'https://secure-global.paytabs.com/payment/request',
      'https://secure.paytabs.sa/payment/request',
      'https://secure-jordan.paytabs.com/payment/request',
      'https://secure-oman.paytabs.com/payment/request'
    ].filter((url, idx, self) => url && self.indexOf(url) === idx);

    const testBody = {
      profile_id: cleanProfileId,
      tran_type: 'sale',
      tran_class: 'ecom',
      cart_id: `test_ping_${Date.now()}`,
      cart_description: 'ORLUXUS Gateway Connection Test',
      cart_currency: 'EUR',
      cart_amount: 1.00,
      callback: 'https://orluxus.com/api/paytabs/callback',
      return: 'https://orluxus.com/booking-confirmation',
      customer_details: {
        name: 'Test Customer',
        email: 'test@orluxus.com',
        phone: '+20100000000',
        street1: 'Test St',
        city: 'Cairo',
        state: 'Cairo',
        country: 'EG',
        zip: '11511'
      }
    };

    let lastError = null;
    let matchedEndpoint = null;
    let successfulData = null;

    for (const ep of candidateUrls) {
      try {
        const response = await fetch(ep, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': cleanServerKey
          },
          body: JSON.stringify(testBody)
        });

        const data = await response.json();

        if (data && data.paypage_url) {
          matchedEndpoint = ep;
          successfulData = data;
          break;
        } else {
          lastError = data?.message || data?.error || 'Authentication error';
        }
      } catch (err) {
        lastError = err.message;
      }
    }

    if (successfulData && matchedEndpoint) {
      return NextResponse.json({
        success: true,
        message: `✅ تم التحقق والاتصال بنجاح مع سيرفر (${matchedEndpoint})! البوابة جاهزة لاستقبال المدفوعات.`,
        paypageUrl: successfulData.paypage_url,
        tranRef: successfulData.tran_ref,
        activeEndpoint: matchedEndpoint
      });
    } else {
      return NextResponse.json({
        success: false,
        error: `تعذر الاتصال بجميع سيرفرات PayTabs (${lastError}). يرجى نسخ مفتاح الـ Server Key من لوحة PayTabs بزر النسخ (Copy) للتأكد من عدم وجود أي حرف ناقص.`,
        lastError
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Paytabs connection test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Network error testing Paytabs endpoint'
    }, { status: 500 });
  }
}
