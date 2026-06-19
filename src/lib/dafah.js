/**
 * Dafah (بوابة دفة) Payment Gateway Integration Helper
 * 
 * This file handles the simulation of the Dafah payment gateway.
 * It also provides complete instructions and structural guidelines below on how to
 * transition to the live production API.
 */

const isClient = typeof window !== 'undefined';

/**
 * Creates a simulated Dafah checkout session and returns a redirection URL.
 * 
 * @param {Object} params
 * @param {string} params.tripId - The ID of the trip or package
 * @param {string} params.title - The name of the trip in Arabic/English
 * @param {number} params.amount - Total price in EUR (€)
 * @param {string} params.customerName - Name of the traveler
 * @param {string} params.phone - Contact phone number
 * @param {string} params.whatsapp - WhatsApp number
 * @param {string} params.date - Scheduled trip date
 * @param {number} params.travelers - Number of travelers
 * @returns {string} Redirection URL to the simulated gateway
 */
export function createDafahCheckoutSession({
  tripId,
  title,
  amount,
  customerName,
  phone,
  whatsapp,
  date,
  travelers
}) {
  const transactionId = `dafah-tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Generate a mock signature/hash (in production this is HMAC SHA-256 using the Secret Key)
  const mockSignature = btoa(`${transactionId}|${amount}|${tripId}`).slice(0, 32);

  // In our simulation, we redirect the user to the checkout page itself with special query parameters
  // that trigger the full-screen Dafah Gateway payment frame overlay.
  const queryParams = new URLSearchParams({
    gatewayMode: 'true',
    tx: transactionId,
    tripId,
    title,
    amount: amount.toString(),
    customerName,
    phone,
    whatsapp,
    date,
    travelers: travelers.toString(),
    sig: mockSignature
  });

  return `/checkout?${queryParams.toString()}`;
}

/**
 * =========================================================================
 *                   GUIDE FOR LIVE DAFAH INTEGRATION
 * =========================================================================
 * 
 * To switch from this simulation to the actual Dafah (دفة) gateway:
 * 
 * 1. Environment Variables (.env.local):
 *    Add your API credentials from your Dafah Merchant Dashboard:
 *    DAFAH_MERCHANT_ID=your_merchant_id
 *    DAFAH_API_KEY=your_public_api_key
 *    DAFAH_SECRET_KEY=your_private_secret_key
 *    DAFAH_API_URL=https://api.dafah.app/v1/checkout  (Or equivalent endpoint)
 * 
 * 2. Creating a Checkout Session (Server-side API route: /api/checkout/route.js):
 *    ```javascript
 *    import crypto from 'crypto';
 * 
 *    export async function POST(req) {
 *      const body = await req.json();
 *      const { tripId, amount, customerName, phone, email } = body;
 *      const transactionId = `tx_${Date.now()}`;
 * 
 *      // Generate Hmac SHA-256 signature to secure the payload
 *      const payload = `${transactionId}|${amount}|EGP`;
 *      const signature = crypto
 *        .createHmac('sha256', process.env.DAFAH_SECRET_KEY)
 *        .update(payload)
 *        .digest('hex');
 * 
 *      const dafahRequest = {
 *        merchant_id: process.env.DAFAH_MERCHANT_ID,
 *        amount: amount,
 *        currency: 'EGP', // Or EUR converted to EGP depending on Dafah account setup
 *        transaction_id: transactionId,
 *        customer: {
 *          name: customerName,
 *          phone: phone,
 *          email: email
 *        },
 *        callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/callback`,
 *        signature: signature
 *      };
 * 
 *      const response = await fetch(process.env.DAFAH_API_URL, {
 *        method: 'POST',
 *        headers: {
 *          'Content-Type': 'application/json',
 *          'Authorization': `Bearer ${process.env.DAFAH_API_KEY}`
 *        },
 *        body: JSON.stringify(dafahRequest)
 *      });
 * 
 *      const result = await response.json();
 *      if (result.success) {
 *        return Response.json({ checkout_url: result.checkout_url });
 *      } else {
 *        return Response.json({ error: 'Failed to create payment session' }, { status: 500 });
 *      }
 *    }
 *    ```
 * 
 * 3. Webhook Endpoint (/api/payment/webhook/route.js):
 *    You must configure this URL in the Dafah dashboard so Dafah calls your backend
 *    immediately when the customer completes payment. This updates your booking status
 *    even if the user closes their browser before returning.
 * 
 *    ```javascript
 *    import crypto from 'crypto';
 *    import { updateBookingStatus } from '@/lib/db-server';
 * 
 *    export async function POST(req) {
 *      const signature = req.headers.get('x-dafah-signature');
 *      const bodyText = await req.text();
 * 
 *      // Verify the request signature
 *      const expectedSignature = crypto
 *        .createHmac('sha256', process.env.DAFAH_SECRET_KEY)
 *        .update(bodyText)
 *        .digest('hex');
 * 
 *      if (signature !== expectedSignature) {
 *        return new Response('Unauthorized Signature', { status: 401 });
 *      }
 * 
 *      const event = JSON.parse(bodyText);
 *      if (event.status === 'PAID') {
 *        const transactionId = event.transaction_id;
 *        const amount = event.amount;
 *        
 *        // 1. Mark booking as PAID in database
 *        await updateBookingStatus(transactionId, 'PAID');
 *        
 *        // 2. Perform payout logic or log commissions for referrers
 *        console.log(`Payment confirmed for transaction: ${transactionId}`);
 *      }
 * 
 *      return new Response('OK', { status: 200 });
 *    }
 *    ```
 */
