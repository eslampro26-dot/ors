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
    const response = await fetch('/api/paytabs/create-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });

    const result = await response.json();

    if (result.success && result.paymentUrl) {
      return { success: true, paymentUrl: result.paymentUrl, tranRef: result.tranRef };
    } else {
      return { success: false, error: result.error || 'Failed to create payment session' };
    }
  } catch (error) {
    console.error('Paytabs payment client error:', error);
    return { success: false, error: error.message || 'Network error connecting to payment gateway' };
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
