import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(request) {
  try {
    // Read from Firebase directly — never trust what comes from the browser
    const settings = await getSettings();

    const profileId = settings?.paytabsProfileId || '';
    const serverKey = settings?.paytabsServerKey || '';
    const savedApiUrl = settings?.paytabsApiUrl || '';

    if (!profileId || !serverKey) {
      return NextResponse.json({
        success: false,
        error: 'المفاتيح غير موجودة في قاعدة البيانات. يرجى حفظ Profile ID و Server Key أولاً من الإعدادات.'
      }, { status: 400 });
    }

    const cleanProfileId = String(profileId).trim();
    const cleanServerKey = String(serverKey).trim();

    // Try all regional endpoints automatically
    const candidateUrls = [
      savedApiUrl,
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
      cart_currency: 'EGP',
      cart_amount: 50.00,
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
        const payUrl = data?.redirect_url || data?.paypage_url;

        if (payUrl) {
          matchedEndpoint = ep;
          successfulData = { ...data, paypage_url: payUrl };
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
        error: `فشل الاتصال بجميع سيرفرات PayTabs. الخطأ: ${lastError}`,
        storedProfileId: cleanProfileId,
        storedKeyPreview: cleanServerKey.substring(0, 8) + '...' + cleanServerKey.slice(-4),
        testedEndpoints: candidateUrls
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Paytabs connection test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'خطأ في السيرفر أثناء اختبار Paytabs'
    }, { status: 500 });
  }
}
