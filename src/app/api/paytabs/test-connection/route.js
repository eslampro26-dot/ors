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

    const endpoint = apiUrl || 'https://secure.paytabs.com/payment/request';

    const testBody = {
      profile_id: String(profileId).trim(),
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

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': String(serverKey).trim()
      },
      body: JSON.stringify(testBody)
    });

    const data = await response.json();

    if (data.paypage_url) {
      return NextResponse.json({
        success: true,
        message: '✅ PayTabs connection successful! Gateway is live and responding.',
        paypageUrl: data.paypage_url,
        tranRef: data.tran_ref
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.message || 'Connection failed: ' + JSON.stringify(data),
        raw: data
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
