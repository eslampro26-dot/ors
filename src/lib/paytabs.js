// Paytabs Payment Integration
// This module handles Paytabs payment gateway integration

import { getSettings } from './db';

/**
 * Create a Paytabs payment page
 * @param {Object} paymentData - Payment details
 * @param {string} paymentData.amount - Payment amount
 * @param {string} paymentData.currency - Currency code (e.g., 'EGP')
 * @param {string} paymentData.customerName - Customer name
 * @param {string} paymentData.customerEmail - Customer email
 * @param {string} paymentData.customerPhone - Customer phone
 * @param {string} paymentData.orderId - Order/Booking ID
 * @param {string} paymentData.productName - Product/Service name
 * @param {string} paymentData.successUrl - Redirect URL on success
 * @param {string} paymentData.cancelUrl - Redirect URL on cancel
 * @param {string} paymentData.callbackUrl - Server callback URL
 * @returns {Promise<Object>} Payment page URL or error
 */
export async function createPaytabsPayment(paymentData) {
  try {
    // Get Paytabs credentials from settings
    const settings = await getSettings();
    const profileId = settings?.paytabsProfileId || '';
    const serverKey = settings?.paytabsServerKey || '';
    const paytabsApiUrl = settings?.paytabsApiUrl || 'https://secure.paytabs.com/payment/request';
    const paytabsEnabled = settings?.paytabsEnabled === true || settings?.paytabsEnabled === 'true';
    
    if (!paytabsEnabled) {
      throw new Error('Paytabs payment is not enabled');
    }
    
    if (!profileId || !serverKey) {
      throw new Error('Paytabs credentials not configured');
    }
    
    const requestBody = {
      profile_id: profileId,
      tran_type: 'sale',
      tran_class: 'ecom',
      cart_id: paymentData.orderId,
      cart_description: paymentData.productName,
      cart_currency: paymentData.currency,
      cart_amount: paymentData.amount,
      callback: paymentData.callbackUrl,
      return: paymentData.successUrl,
      return_auth: 'signed',
      customer_details: {
        name: paymentData.customerName,
        email: paymentData.customerEmail,
        phone: paymentData.customerPhone,
        street1: '',
        city: '',
        state: '',
        country: 'EG',
        zip: ''
      },
      shipping_details: {
        name: paymentData.customerName,
        email: paymentData.customerEmail,
        phone: paymentData.customerPhone,
        street1: '',
        city: '',
        state: '',
        country: 'EG',
        zip: ''
      },
      frame: false,
      hide_shipping: true,
      language: 'en'
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
      return { success: true, paymentUrl: result.paypage_url, tranRef: result.tran_ref };
    } else {
      throw new Error(result.message || 'Failed to create payment page');
    }
  } catch (error) {
    console.error('Paytabs payment error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Verify Paytabs payment callback
 * @param {Object} callbackData - Callback data from Paytabs
 * @returns {Promise<Object>} Verification result
 */
export async function verifyPaytabsPayment(callbackData) {
  try {
    const settings = await getSettings();
    const serverKey = settings?.paytabsServerKey || '';
    const paytabsApiUrl = settings?.paytabsApiUrl || 'https://secure.paytabs.com/payment/request';
    const verifyUrl = paytabsApiUrl.replace('/payment/request', '/payment/query');
    
    if (!serverKey) {
      throw new Error('Paytabs server key not configured');
    }

    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': serverKey
      },
      body: JSON.stringify({
        profile_id: settings?.paytabsProfileId,
        tran_ref: callbackData.tran_ref
      })
    });

    const result = await response.json();

    if (result.payment_result && result.payment_result.response_status === 'A') {
      return { 
        success: true, 
        paid: true, 
        amount: result.cart_amount,
        currency: result.cart_currency,
        tranRef: result.tran_ref
      };
    } else {
      return { 
        success: true, 
        paid: false, 
        status: result.payment_result?.response_status || 'unknown'
      };
    }
  } catch (error) {
    console.error('Paytabs verification error:', error);
    return { success: false, error: error.message };
  }
}
