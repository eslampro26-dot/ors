import nodemailer from 'nodemailer';

// Company contact info (Default Fallbacks from .env)
const COMPANY_EMAIL_DEFAULT = process.env.COMPANY_EMAIL || 'info@orluxus.com';
const SMTP_HOST_DEFAULT = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT_DEFAULT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER_DEFAULT = process.env.SMTP_USER || '';
const SMTP_PASS_DEFAULT = process.env.SMTP_PASS || '';

// Fetch SMTP settings from Firestore via the internal settings API
// This avoids importing Firebase Client SDK in a server-side API route
async function loadSmtpSettings(request) {
  try {
    const baseUrl = request
      ? `${request.headers.get('x-forwarded-proto') || 'https'}://${request.headers.get('host')}`
      : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
    const res = await fetch(`${baseUrl}/api/settings`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return {
        smtpHost: data.smtpHost || SMTP_HOST_DEFAULT,
        smtpPort: parseInt(data.smtpPort || SMTP_PORT_DEFAULT.toString(), 10),
        smtpUser: data.smtpUser || SMTP_USER_DEFAULT,
        smtpPass: data.smtpPass || SMTP_PASS_DEFAULT,
        companyEmail: data.companyEmail || COMPANY_EMAIL_DEFAULT,
      };
    }
  } catch (err) {
    console.warn('[send-booking-email] Could not load settings from DB, using .env fallbacks:', err.message);
  }
  return {
    smtpHost: SMTP_HOST_DEFAULT,
    smtpPort: SMTP_PORT_DEFAULT,
    smtpUser: SMTP_USER_DEFAULT,
    smtpPass: SMTP_PASS_DEFAULT,
    companyEmail: COMPANY_EMAIL_DEFAULT,
  };
}

const EMERGENCY_PHONE = '+201038820014';
const CUSTOMER_SERVICE_PHONE = '+201038820019';

function buildInvoiceHTML(data) {
  const {
    customerName, email, phone, whatsapp, date, travelers,
    serviceName, originalAmount, discountAmount, finalAmount,
    paymentType, txId, extras, pickupLocation, promoCode,
    agentName, children, infants, specialRequests,
    bookingDateTime
  } = data;

  const isBank = paymentType === 'bank_transfer';
  const isOnsite = paymentType === 'onsite' || paymentType === 'cash';
  const paymentStatus = isBank ? 'PENDING BANK TRANSFER' : isOnsite ? 'PAY ON ARRIVAL' : 'PAID IN FULL';
  const paymentColor = (isBank || isOnsite) ? '#b45309' : '#10b981';

  const invoiceNo = txId.replace('pp-tx-', '').replace('cash-tx-', '').replace('dafah-tx-', '').replace('bank-tx-', '').replace('apple_pay-tx-', '').replace('google_pay-tx-', '').slice(0, 8).toUpperCase();

  return `
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ORLUXUS Booking Invoice #${invoiceNo}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:680px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 30px rgba(0,0,0,0.1);">
    
    <!-- HEADER -->
    <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:40px 40px 30px;text-align:center;">
      <h1 style="margin:0;font-size:2.2rem;font-weight:900;color:#c9a227;letter-spacing:4px;">ORLUXUS</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.6);font-size:0.85rem;letter-spacing:1px;">WITH A FAMILY SPIRIT — Premium Egypt Travel</p>
      <div style="margin:20px auto 0;display:inline-block;background:rgba(201,162,39,0.15);border:1px solid #c9a227;border-radius:8px;padding:8px 24px;">
        <span style="color:#c9a227;font-size:0.8rem;font-weight:700;letter-spacing:2px;">BOOKING INVOICE #${invoiceNo}</span>
      </div>
    </div>

    <!-- BOOKING CONFIRMED BANNER -->
    <div style="background:${(isBank || isOnsite) ? '#fffbeb' : '#f0fdf4'};border-bottom:3px solid ${paymentColor};padding:20px 40px;text-align:center;">
      <div style="font-size:1.8rem;margin-bottom:6px;">${(isBank || isOnsite) ? '⏳' : '✅'}</div>
      <h2 style="margin:0;color:${paymentColor};font-size:1.3rem;font-weight:800;">
        ${isBank ? 'Booking Registered — Awaiting Bank Transfer' : isOnsite ? 'Booking Confirmed — Pay on Arrival' : 'Payment Confirmed — Booking Active!'}
      </h2>
      <p style="margin:6px 0 0;color:#64748b;font-size:0.9rem;">
        Issued: ${bookingDateTime}
      </p>
    </div>

    <!-- BODY -->
    <div style="padding:40px;">

      <!-- TRAVELER DETAILS -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:30px;">
        <tr>
          <td style="width:50%;vertical-align:top;padding-right:20px;">
            <h3 style="margin:0 0 14px;font-size:0.75rem;color:#94a3b8;text-transform:uppercase;letter-spacing:2px;">Traveler Details</h3>
            <p style="margin:0 0 6px;font-weight:700;font-size:1.05rem;color:#0f172a;">${customerName}</p>
            ${email ? `<p style="margin:0 0 5px;color:#475569;font-size:0.9rem;">✉ ${email}</p>` : ''}
            <p style="margin:0 0 5px;color:#475569;font-size:0.9rem;">📞 ${phone}</p>
            ${whatsapp ? `<p style="margin:0 0 5px;color:#475569;font-size:0.9rem;">💬 ${whatsapp}</p>` : ''}
          </td>
          <td style="width:50%;vertical-align:top;padding-left:20px;border-left:2px solid #f1f5f9;">
            <h3 style="margin:0 0 14px;font-size:0.75rem;color:#94a3b8;text-transform:uppercase;letter-spacing:2px;">Booking Info</h3>
            <p style="margin:0 0 6px;font-weight:700;color:#0f172a;">📅 ${date}</p>
            <p style="margin:0 0 5px;color:#475569;font-size:0.9rem;">👥 ${travelers} Adult(s)${children > 0 ? ` | ${children} Child(ren)` : ''}${infants > 0 ? ` | ${infants} Infant(s)` : ''}</p>
            ${pickupLocation ? `<p style="margin:0 0 5px;color:#475569;font-size:0.9rem;">📍 ${pickupLocation}</p>` : ''}
            <p style="margin:0;font-weight:700;font-size:0.9rem;color:${paymentColor};">💳 ${paymentStatus}</p>
          </td>
        </tr>
      </table>

      <!-- SERVICE TABLE -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;border-radius:12px;overflow:hidden;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="padding:14px 16px;text-align:left;font-size:0.8rem;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Service</th>
            <th style="padding:14px 16px;text-align:center;font-size:0.8rem;color:#64748b;font-weight:700;">Qty</th>
            <th style="padding:14px 16px;text-align:right;font-size:0.8rem;color:#64748b;font-weight:700;">Rate</th>
            <th style="padding:14px 16px;text-align:right;font-size:0.8rem;color:#64748b;font-weight:700;">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom:1px solid #f1f5f9;">
            <td style="padding:16px;font-weight:600;color:#1e293b;">${serviceName}</td>
            <td style="padding:16px;text-align:center;color:#475569;">${travelers}</td>
            <td style="padding:16px;text-align:right;color:#475569;">€${(originalAmount / travelers).toFixed(2)}</td>
            <td style="padding:16px;text-align:right;font-weight:700;color:#1e293b;">€${originalAmount.toFixed(2)}</td>
          </tr>
          ${extras ? `
          <tr style="border-bottom:1px solid #f1f5f9;background:#fafafa;">
            <td style="padding:12px 16px;color:#64748b;font-size:0.9rem;" colspan="3">🎁 Add-ons: ${extras}</td>
            <td style="padding:12px 16px;text-align:right;color:#64748b;font-weight:600;">Included</td>
          </tr>` : ''}
          ${discountAmount > 0 ? `
          <tr style="border-bottom:1px solid #f1f5f9;background:#fef2f2;">
            <td style="padding:12px 16px;color:#dc2626;font-weight:600;" colspan="3">🏷 Promo Discount${promoCode ? ` (${promoCode})` : ''}</td>
            <td style="padding:12px 16px;text-align:right;color:#dc2626;font-weight:700;">-€${discountAmount.toFixed(2)}</td>
          </tr>` : ''}
        </tbody>
      </table>

      <!-- TOTAL -->
      <div style="background:linear-gradient(135deg,#0f172a,#1e293b);border-radius:12px;padding:20px 24px;display:flex;justify-content:space-between;align-items:center;margin-bottom:30px;">
        <div>
          <span style="display:block;font-size:0.75rem;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1px;">Total Booking Value</span>
          <span style="display:block;font-size:2rem;font-weight:900;color:#c9a227;margin-top:4px;">€${finalAmount.toFixed(2)}</span>
        </div>
        <div style="text-align:right;">
          <span style="display:block;font-size:0.75rem;color:rgba(255,255,255,0.5);margin-bottom:4px;">Status</span>
          <span style="background:${paymentColor};color:#fff;padding:6px 16px;border-radius:999px;font-weight:700;font-size:0.85rem;">${paymentStatus}</span>
        </div>
      </div>

      ${agentName && agentName !== 'مباشر (بدون وكيل)' ? `
      <div style="background:#fffbeb;border:1px solid #fbbf24;border-radius:8px;padding:12px 16px;margin-bottom:24px;font-size:0.9rem;color:#92400e;">
        🤝 Referred by Agent: <strong>${agentName}</strong>
      </div>` : ''}

      ${specialRequests ? `
      <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:12px 16px;margin-bottom:24px;font-size:0.9rem;color:#0369a1;">
        💬 Special Requests: ${specialRequests}
      </div>` : ''}

      ${isBank ? `
      <!-- BANK TRANSFER INFO -->
      <div style="background:#fffbeb;border:2px solid #f59e0b;border-radius:12px;padding:24px;margin-bottom:30px;">
        <h3 style="margin:0 0 16px;color:#b45309;font-size:1rem;">⚠️ Action Required: Complete Bank Transfer</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:6px 0;color:#64748b;font-size:0.9rem;">Bank:</td><td style="font-weight:700;text-align:right;">QNB EGYPT</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;font-size:0.9rem;">Account Name:</td><td style="font-weight:700;text-align:right;">ORLUXUS GROUP Ltd.</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;font-size:0.9rem;">Account No:</td><td style="font-weight:700;text-align:right;">20330745261-75</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;font-size:0.9rem;">IBAN:</td><td style="font-weight:700;text-align:right;font-size:0.85rem;">EG540002020300203307452617589</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;font-size:0.9rem;">Swift:</td><td style="font-weight:700;text-align:right;">MSYREGCX</td></tr>
        </table>
      </div>` : ''}

      <!-- CONTACT NUMBERS -->
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
        <h3 style="margin:0 0 14px;font-size:0.85rem;color:#64748b;text-transform:uppercase;letter-spacing:1px;">📞 ORLUXUS Contact Numbers</h3>
        <table style="width:100%;">
          <tr>
            <td style="padding:6px 0;">
              <span style="background:#dc2626;color:#fff;padding:3px 10px;border-radius:999px;font-size:0.75rem;font-weight:700;margin-right:10px;">EMERGENCY</span>
              <a href="tel:${EMERGENCY_PHONE}" style="color:#dc2626;font-weight:700;text-decoration:none;font-size:1rem;">${EMERGENCY_PHONE}</a>
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0;">
              <span style="background:#10b981;color:#fff;padding:3px 10px;border-radius:999px;font-size:0.75rem;font-weight:700;margin-right:10px;">CUSTOMER SERVICE</span>
              <a href="tel:${CUSTOMER_SERVICE_PHONE}" style="color:#10b981;font-weight:700;text-decoration:none;font-size:1rem;">${CUSTOMER_SERVICE_PHONE}</a>
            </td>
          </tr>
        </table>
      </div>

      <!-- TERMS AGREEMENT FOOTER -->
      <div style="border:1px dashed #cbd5e1;border-radius:8px;padding:16px;margin-bottom:10px;font-size:0.8rem;color:#64748b;line-height:1.6;">
        <strong style="color:#334155;display:block;margin-bottom:6px;">📋 Terms & Conditions Agreement</strong>
        By completing this booking, the traveler <strong>${customerName}</strong> has electronically agreed to ORLUXUS Terms and Conditions, 
        Cancellation Policy, and Data Protection Policy. This booking serves as a digital contract between the traveler and ORLUXUS GROUP Ltd.
        <br><br>
        <span style="color:#94a3b8;font-size:0.75rem;">
          Transaction ID: ${txId} | Booking Time: ${bookingDateTime} | Agreed by: ${customerName} (${email || phone})
        </span>
      </div>
    </div>

    <!-- FOOTER -->
    <div style="background:#0f172a;padding:24px 40px;text-align:center;">
      <p style="margin:0;color:#c9a227;font-size:0.85rem;font-weight:700;letter-spacing:2px;">ORLUXUS GROUP Ltd.</p>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.4);font-size:0.75rem;">Company Reg. No. 7291-B | info@orluxus.com</p>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.4);font-size:0.75rem;">© ${new Date().getFullYear()} ORLUXUS. All Rights Reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export async function POST(request) {
  try {
    const body = await request.json();

    // 1. Check if this is an SMTP Connection Test
    if (body.action === 'test') {
      const { smtpHost, smtpPort, smtpUser, smtpPass, companyEmail } = body;
      if (!smtpUser || !smtpPass) {
        return Response.json({ success: false, error: 'يرجى إدخال إيميل وكلمة مرور SMTP أولاً' });
      }
      try {
        const testTransporter = nodemailer.createTransport({
          host: smtpHost || 'smtp.gmail.com',
          port: parseInt(smtpPort || '587', 10),
          secure: parseInt(smtpPort, 10) === 465,
          auth: { user: smtpUser, pass: smtpPass },
        });
        await testTransporter.sendMail({
          from: `"ORLUXUS Test" <${smtpUser}>`,
          to: companyEmail || smtpUser,
          subject: '[ORLUXUS] SMTP Connection Test ✔️',
          html: `<h3 style="color:#10b981">✅ Connection Successful!</h3><p>Your SMTP configuration is working correctly on the ORLUXUS platform.</p><p><small>Time: ${new Date().toLocaleString()}</small></p>`,
        });
        return Response.json({ success: true, message: 'Test email sent successfully' });
      } catch (smtpErr) {
        console.error('[send-booking-email] SMTP test failed:', smtpErr.message);
        return Response.json({
          success: false,
          error: `فشل الاتصال: ${smtpErr.message || 'تحقق من بيانات SMTP وكلمة مرور التطبيق'}`
        });
      }
    }

    const {
      customerName, email, phone, whatsapp, date, travelers = 1,
      serviceName, originalAmount, discountAmount, finalAmount,
      paymentType, txId, extras, pickupLocation, promoCode,
      agentName, children = 0, infants = 0, specialRequests,
    } = body;

    // Validate required fields
    if (!customerName || !email || !txId || !serviceName) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 2. Fetch SMTP settings via internal API (avoids Firebase Client SDK issues on server)
    const {
      smtpHost: activeSmtpHost,
      smtpPort: activeSmtpPort,
      smtpUser: activeSmtpUser,
      smtpPass: activeSmtpPass,
      companyEmail: activeCompanyEmail,
    } = await loadSmtpSettings(request);

    // Build booking datetime string
    const bookingDateTime = new Date().toLocaleString('en-GB', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });

    const invoiceData = {
      customerName, email, phone, whatsapp, date, travelers,
      serviceName, originalAmount, discountAmount, finalAmount,
      paymentType, txId, extras, pickupLocation, promoCode,
      agentName, children, infants, specialRequests, bookingDateTime
    };

    const htmlContent = buildInvoiceHTML(invoiceData);
    const subject = `[ORLUXUS] Booking Confirmation — ${serviceName} | #${txId.slice(-8).toUpperCase()}`;

    // If no SMTP credentials, skip actually sending (log only)
    if (!activeSmtpUser || !activeSmtpPass) {
      console.log('[send-booking-email] SMTP credentials missing. Email logging fallback:', email, activeCompanyEmail);
      return Response.json({ success: true, message: 'Booking saved (SMTP not configured — email not sent)' });
    }

    try {
      const transporter = nodemailer.createTransport({
        host: activeSmtpHost,
        port: activeSmtpPort,
        secure: activeSmtpPort === 465,
        auth: { user: activeSmtpUser, pass: activeSmtpPass },
      });

      // Send to customer
      await transporter.sendMail({
        from: `"ORLUXUS" <${activeSmtpUser}>`,
        to: email,
        subject,
        html: htmlContent,
      });

      // Send to company email
      await transporter.sendMail({
        from: `"ORLUXUS Booking System" <${activeSmtpUser}>`,
        to: activeCompanyEmail,
        subject: `[NEW BOOKING] ${customerName} — ${serviceName} | €${finalAmount.toFixed(2)}`,
        html: htmlContent,
      });

      return Response.json({ success: true, message: 'Emails sent successfully' });
    } catch (mailErr) {
      // Email failed but booking was already saved — return success so checkout doesn't break
      console.error('[send-booking-email] Mail send failed:', mailErr.message);
      return Response.json({ success: true, message: 'Booking confirmed (email delivery failed)', emailError: mailErr.message });
    }

  } catch (error) {
    console.error('[send-booking-email] Unexpected error:', error);
    return Response.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
