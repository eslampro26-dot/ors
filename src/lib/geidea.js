/**
 * Geidea Payment Gateway Integration Helper for ORLUXUS
 * 
 * Documentation: https://docs.geidea.net/
 * Currency: EGP (Egyptian Pound)
 */

export const GEIDEA_CONFIG = {
  merchantPublicKey: process.env.NEXT_PUBLIC_GEIDEA_MERCHANT_KEY || '',
  apiPassword: process.env.GEIDEA_API_PASSWORD || '',
  isProduction: process.env.NODE_ENV === 'production',
  currency: 'EGP',
  // Endpoints
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://api.merchant.geidea.net/pgw/api/v1/direct' 
    : 'https://api.merchant.geidea.net/pgw/api/v1/direct', // Geidea uses same domain with test credentials
};

/**
 * Creates a Geidea payment session
 * @param {Object} params - { amount, currency, orderId, customerEmail, callbackUrl }
 */
export async function createGeideaSession({ amount, orderId, customerEmail, customerPhone, callbackUrl }) {
  if (!GEIDEA_CONFIG.merchantPublicKey || !GEIDEA_CONFIG.apiPassword) {
    throw new Error('Geidea credentials are not configured in environment variables.');
  }

  const credentials = Buffer.from(
    `${GEIDEA_CONFIG.merchantPublicKey}:${GEIDEA_CONFIG.apiPassword}`
  ).toString('base64');

  const payload = {
    amount: Number(amount).toFixed(2),
    currency: 'EGP',
    merchantReferenceId: orderId,
    callbackUrl: callbackUrl || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.orluxus.com'}/api/geidea/callback`,
    customer: {
      email: customerEmail,
      phone: customerPhone,
    },
    paymentMethods: ['card'],
  };

  const response = await fetch(`${GEIDEA_CONFIG.baseUrl}/ecom/v2/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${credentials}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Geidea Error: ${errorData.detailedResponseCode || errorData.responseMessage || 'Session creation failed'}`);
  }

  return await response.json();
}
