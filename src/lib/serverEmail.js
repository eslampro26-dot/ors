import nodemailer from 'nodemailer';
import { getSettings } from '@/lib/db';
import { generateContract } from '@/lib/contractGenerator';

// Default SMTP fallbacks
const SMTP_HOST_DEFAULT = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT_DEFAULT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER_DEFAULT = process.env.SMTP_USER || '';
const SMTP_PASS_DEFAULT = process.env.SMTP_PASS || '';
const COMPANY_EMAIL_DEFAULT = process.env.COMPANY_EMAIL || 'info@orluxus.com';

const EMERGENCY_PHONE = '+201038820014';
const CUSTOMER_SERVICE_PHONE = '+201038820019';

/**
 * Builds the responsive HTML email template for booking invoices & tickets
 */
export function buildBookingInvoiceHTML(data) {
  const {
    customerName, email, phone, whatsapp, date, travelers,
    serviceName, originalAmount, discountAmount, finalAmount,
    paymentType, txId, extras, pickupLocation, promoCode,
    agentName, children, infants, specialRequests,
    bookingDateTime, adultPrice, childPrice, infantPrice,
    status
  } = data;

  const isConfirmed = status === 'Confirmed' || status === 'مؤكد' || paymentType === 'paytabs' || paymentType === 'card';
  const isBank = paymentType === 'bank_transfer';
  const isOnsite = paymentType === 'onsite' || paymentType === 'cash';
  const paymentStatus = isConfirmed ? 'PAID & CONFIRMED' : (isBank ? 'PENDING BANK TRANSFER' : (isOnsite ? 'PAY ON ARRIVAL' : 'CONFIRMED'));
  const paymentColor = (isBank || isOnsite) ? '#b45309' : '#10b981';

  const invoiceNo = String(txId || data.id || Date.now().toString()).replace(/[^a-zA-Z0-9]/g, '').slice(-8).toUpperCase();

  const numAdults = Number(travelers) || 1;
  const numChildren = Number(children) || 0;
  const numInfants = Number(infants) || 0;
  const adultPriceVal = Number(adultPrice) || (originalAmount / numAdults) || 0;
  const childPriceVal = Number(childPrice) || 0;
  const infantPriceVal = Number(infantPrice) || 0;

  const adultTotal = numAdults * adultPriceVal;
  const childTotal = numChildren * childPriceVal;
  const infantTotal = numInfants * infantPriceVal;

  const lang = (data.locale || data.customerLanguage || 'en').toLowerCase();

  return `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ORLUXUS Official Booking Confirmation - #${invoiceNo}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0d1117; color: #e6edf3; margin: 0; padding: 20px; }
    .container { max-width: 650px; margin: 0 auto; background: #161b22; border: 1px solid #30363d; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .header { background: linear-gradient(135deg, #1f293d 0%, #0d1117 100%); padding: 30px 25px; text-align: center; border-bottom: 2px solid #d4af37; }
    .header h1 { color: #d4af37; margin: 0; font-size: 26px; letter-spacing: 2px; text-transform: uppercase; }
    .header p { color: #8b949e; margin: 5px 0 0; font-size: 13px; }
    .badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 13px; margin-top: 15px; }
    .badge-success { background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid #10b981; }
    .badge-pending { background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid #f59e0b; }
    .content { padding: 25px; }
    .section-title { color: #d4af37; font-size: 15px; font-weight: bold; text-transform: uppercase; margin-bottom: 12px; border-bottom: 1px solid #21262d; padding-bottom: 6px; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .info-table td { padding: 8px 0; font-size: 14px; }
    .info-label { color: #8b949e; width: 40%; }
    .info-val { color: #f0f6fc; font-weight: 600; text-align: right; }
    .summary-card { background: #0d1117; border: 1px solid #30363d; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
    .price-row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 14px; }
    .price-total { display: flex; justify-content: space-between; border-top: 1px solid #30363d; padding-top: 10px; margin-top: 10px; font-size: 18px; font-weight: bold; color: #10b981; }
    .contact-box { background: rgba(212, 175, 55, 0.08); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 8px; padding: 15px; text-align: center; margin-top: 20px; }
    .contact-box a { color: #d4af37; text-decoration: none; font-weight: bold; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #8b949e; border-top: 1px solid #21262d; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ORLUXUS</h1>
      <p>Luxury Travel & VIP Excursions</p>
      <div class="badge ${isConfirmed ? 'badge-success' : 'badge-pending'}">
        ✓ ${paymentStatus}
      </div>
    </div>
    
    <div class="content">
      <div class="section-title">🎫 Traveler & Excursion Information</div>
      <table class="info-table">
        <tr>
          <td class="info-label">Guest Name:</td>
          <td class="info-val">${customerName || 'Valued Guest'}</td>
        </tr>
        <tr>
          <td class="info-label">Booking Reference:</td>
          <td class="info-val" style="color: #d4af37; font-family: monospace; font-size: 16px;">#${invoiceNo}</td>
        </tr>
        <tr>
          <td class="info-label">Service / Tour:</td>
          <td class="info-val">${serviceName || 'Excursion'}</td>
        </tr>
        <tr>
          <td class="info-label">Date:</td>
          <td class="info-val">${date || 'Scheduled Date'}</td>
        </tr>
        <tr>
          <td class="info-label">Travelers:</td>
          <td class="info-val">${numAdults} Adults ${numChildren > 0 ? `+ ${numChildren} Children` : ''}</td>
        </tr>
        ${pickupLocation ? `
        <tr>
          <td class="info-label">Pickup Location:</td>
          <td class="info-val">${pickupLocation}</td>
        </tr>
        ` : ''}
        ${specialRequests ? `
        <tr>
          <td class="info-label">Special Requests:</td>
          <td class="info-val">${specialRequests}</td>
        </tr>
        ` : ''}
      </table>

      <div class="section-title">💳 Payment Summary</div>
      <div class="summary-card">
        <table style="width:100%; border-collapse: collapse;">
          <tr>
            <td style="color:#8b949e; padding: 4px 0;">Base Fare (${numAdults} Adults):</td>
            <td style="text-align:right; font-weight:600; color:#f0f6fc;">€${adultTotal.toFixed(2)}</td>
          </tr>
          ${numChildren > 0 ? `
          <tr>
            <td style="color:#8b949e; padding: 4px 0;">Children (${numChildren}x):</td>
            <td style="text-align:right; font-weight:600; color:#f0f6fc;">€${childTotal.toFixed(2)}</td>
          </tr>
          ` : ''}
          ${numInfants > 0 ? `
          <tr>
            <td style="color:#8b949e; padding: 4px 0;">Infants (${numInfants}x):</td>
            <td style="text-align:right; font-weight:600; color:#f0f6fc;">€${infantTotal.toFixed(2)}</td>
          </tr>
          ` : ''}
          ${(() => {
            // Compute extras total from the difference between originalAmount and person-based totals
            const personTotal = adultTotal + childTotal + infantTotal;
            const extrasAmt = Number(originalAmount) - personTotal;
            if (extrasAmt > 0.01) {
              const extrasLabel = data.extras ? `Additional Services (${data.extras})` : 'Additional Services / Extras';
              return `<tr>
            <td style="color:#8b949e; padding: 4px 0;">🎁 ${extrasLabel}:</td>
            <td style="text-align:right; font-weight:600; color:#f0f6fc;">€${extrasAmt.toFixed(2)}</td>
          </tr>`;
            }
            return '';
          })()}
          ${discountAmount > 0 ? `
          <tr>
            <td style="color:#10b981; padding: 4px 0;">Discount Applied (${promoCode || 'Promo'}):</td>
            <td style="text-align:right; font-weight:600; color:#10b981;">-€${Number(discountAmount).toFixed(2)}</td>
          </tr>
          ` : ''}
          <tr style="border-top: 1px solid #30363d;">
            <td style="padding-top: 10px; font-weight:bold; font-size:15px; color:#d4af37;">
              ${isOnsite ? '💵 Amount Due upon Arrival (Cash):' : (isBank ? '⏳ Amount to Transfer:' : 'Total Paid:')}
            </td>
            <td style="padding-top: 10px; text-align:right; font-weight:bold; font-size:18px; color:${isOnsite ? '#f59e0b' : '#10b981'};">
              ${data.original_currency && data.original_currency !== 'EGP' && data.final_egp_amount
                ? `${data.original_amount} ${data.original_currency} <span style="font-size:13px; color:#8b949e; display:block;">(${Number(data.final_egp_amount).toLocaleString()} EGP)</span>`
                : `€${Number(finalAmount || originalAmount).toFixed(2)}`}
            </td>
          </tr>
        </table>
      </div>

      <div class="contact-box">
        <div style="font-weight: bold; color: #d4af37; margin-bottom: 5px;">📞 24/7 VIP Concierge & Guest Support</div>
        <div style="font-size: 13px; color: #8b949e;">WhatsApp: <a href="https://wa.me/${CUSTOMER_SERVICE_PHONE.replace(/[^0-9]/g, '')}">${CUSTOMER_SERVICE_PHONE}</a></div>
        <div style="font-size: 13px; color: #8b949e;">Emergency: <a href="tel:${EMERGENCY_PHONE}">${EMERGENCY_PHONE}</a></div>
      </div>

      <!-- Electronic Contract & Digital Signature Section -->
      <div style="margin-top: 25px; border-top: 2px dashed #30363d; padding-top: 20px;">
        <div class="section-title">📜 اتفاقية الوساطة السياحية والتسويق الإلكتروني والتوقيع الرقمي / Legal Agreement & Digital Signature</div>
        
        <div style="background: #0d1117; border: 1px solid rgba(212, 175, 55, 0.4); border-radius: 8px; padding: 20px; margin-bottom: 15px; line-height: 1.6;">
          
          <div style="text-align: center; border-bottom: 1px solid #30363d; padding-bottom: 12px; margin-bottom: 14px;">
            <div style="font-size: 14px; color: #d4af37; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
              اتفاقية خدمات التسويق والوساطة السياحية والتنظيمية
            </div>
            <div style="font-size: 11px; color: #8b949e; margin-top: 3px;">
              INTEGRATED MARKETING &amp; TOURISM BROKERAGE AGREEMENT
            </div>
          </div>

          <!-- Parties -->
          <div style="font-size: 12px; color: #c9d1d9; background: rgba(255,255,255,0.02); border: 1px solid #21262d; border-radius: 6px; padding: 10px; margin-bottom: 14px;">
            <p style="margin: 0 0 6px 0;"><strong>الطرف الأول:</strong> شركة أورلوكسوس للتسويق والوساطة السياحية (ORLUXUS MARKETING &amp; BRANDING) — المقر: Taksim El-Nasr, Hurghada 1, Red Sea 1966533.</p>
            <p style="margin: 0;"><strong>الطرف الثاني (العميل):</strong> ${(data.electronicSignature?.name || customerName || 'Valued Guest')} — البريد الإلكتروني: ${(data.electronicSignature?.email || email || 'N/A')}${phone ? ` — الهاتف: ${phone}` : ''}.</p>
          </div>

          <!-- Signature Verification Box -->
          <div style="background: rgba(212, 175, 55, 0.08); border: 1.5px solid rgba(212, 175, 55, 0.4); border-radius: 6px; padding: 14px; margin-bottom: 16px;">
            <div style="font-size: 12px; color: #d4af37; font-weight: bold; margin-bottom: 8px;">
              📝 تفاصيل وبيانات التوقيع الإلكتروني الموثق / Electronic Signature Record:
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <tr style="border-bottom: 1px solid rgba(212,175,55,0.2);">
                <td style="color: #8b949e; padding: 5px 0;">الاسم الكامل للموقع:</td>
                <td style="color: #f0f6fc; font-weight: bold; text-align: right;">${(data.electronicSignature?.name || customerName || 'Valued Guest')}</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(212,175,55,0.2);">
                <td style="color: #8b949e; padding: 5px 0;">البريد الإلكتروني المعتمد:</td>
                <td style="color: #f0f6fc; text-align: right;">${(data.electronicSignature?.email || email || 'N/A')}</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(212,175,55,0.2);">
                <td style="color: #8b949e; padding: 5px 0;">تاريخ ووقت التوقيع:</td>
                <td style="color: #f0f6fc; text-align: right; font-family: monospace;">${new Date(data.electronicSignature?.timestamp || data.signatureTimestamp || Date.now()).toLocaleString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(212,175,55,0.2);">
                <td style="color: #8b949e; padding: 5px 0;">كود المرجع والمعاملة:</td>
                <td style="color: #d4af37; text-align: right; font-family: monospace; font-weight: bold;">#${invoiceNo}</td>
              </tr>
              <tr>
                <td style="color: #8b949e; padding: 5px 0;">السند والحجية القانونية:</td>
                <td style="color: #10b981; text-align: right; font-weight: bold;">✓ توقيع إلكتروني نافذ وملزم قانوناً (قانون 15 لسنة 2004)</td>
              </tr>
            </table>
          </div>

          <!-- Full Contract Articles -->
          <div style="font-size: 11px; color: #8b949e; text-align: justify; line-height: 1.7;">
            <p style="margin: 0 0 8px 0; color: #c9d1d9;">
              <strong>المادة (1) - طبيعة عمل الشركة:</strong> تقر الشركة بأنها منصة تسويق إلكتروني وعلامة تجارية تعمل كوسيط تنظيمي ومسوق للخدمات السياحية والترفيهية بين العملاء ومقدمي الخدمات المرخصين، وتتولى تنظيم الحجوزات والمتابعة وخدمة العملاء.
            </p>
            <p style="margin: 0 0 8px 0; color: #c9d1d9;">
              <strong>المادة (2) - الموافقة الإلكترونية ونفاذ العقد:</strong> بموجب النقر على زر الموافقة وإتمام الحجز والدفع، يُعد ذلك رضاءً وتوقيعاً إلكترونياً صحيحاً ونافذاً ومنتجاً لكافة آثاره القانونية طبقاً لأحكام قانون التوقيع الإلكتروني المصري رقم 15 لسنة 2004 ولا يجوز إنكار حجيته.
            </p>
            <p style="margin: 0 0 8px 0; color: #c9d1d9;">
              <strong>المادة (3) - سياسة الإلغاء والاسترداد:</strong> يخضع الإلغاء والاسترداد للشروط المعلنة عند الحجز، ويتاح الإلغاء المجاني حتى 48 ساعة قبل موعد انطلاق الرحلة طبقاً لأحكام قانون حماية المستهلك رقم 181 لسنة 2018.
            </p>
            <p style="margin: 0 0 8px 0; color: #c9d1d9;">
              <strong>المادة (4) - إقرار المخاطر والسلامة الشخصية:</strong> يقر العميل بعلمه بطبيعة الأنشطة البحرية والرحلات، والتزامه الكامل بتعليمات السلامة الصادرة عن المرشدين والمشرفين، ومشاركته بمسؤوليته الشخصية مع التوصية بالحصول على وثيقة تأمين سفر.
            </p>
            <p style="margin: 0 0 8px 0; color: #c9d1d9;">
              <strong>المادة (5) - حماية البيانات والخصوصية:</strong> تلتزم الشركة بجمع ومعالجة بيانات العميل في نطاق تنفيذ الحجز وتقديم الخدمة فقط وبأعلى معايير الأمان طبقاً لقانون حماية البيانات الشخصية المصري رقم 151 لسنة 2020.
            </p>
            <p style="margin: 0 0 12px 0; color: #c9d1d9;">
              <strong>المادة (6) - القانون الواجب التطبيق:</strong> تخضع هذه الاتفاقية وتفسر وفقاً لأحكام القوانين السارية في جمهورية مصر العربية، وتختص محاكم القاهرة بفض أي نزاع قد ينشأ عنها في حال تعذر الحل الودي.
            </p>
          </div>

          <!-- Signatures Box -->
          <table style="width: 100%; border-collapse: collapse; margin-top: 14px; padding-top: 12px; border-top: 1px solid #30363d; font-size: 12px;">
            <tr>
              <td style="vertical-align: top; width: 50%;">
                <span style="color: #8b949e; display: block; font-size: 11px; margin-bottom: 3px;">توقيع الطرف الأول (الشركة):</span>
                <strong style="color: #d4af37; font-size: 13px;">ORLUXUS MARKETING &amp; BRANDING</strong>
                <span style="display: block; color: #8b949e; font-size: 10px; margin-top: 2px;">مقر الشركة: Taksim El-Nasr, Hurghada 1, Red Sea</span>
              </td>
              <td style="vertical-align: top; text-align: right; width: 50%;">
                <span style="color: #8b949e; display: block; font-size: 11px; margin-bottom: 3px;">توقيع الطرف الثاني (العميل):</span>
                <strong style="color: #10b981; font-size: 13px;">✓ ${(data.electronicSignature?.name || customerName || 'Valued Guest')}</strong>
                <span style="display: block; color: #10b981; font-size: 10px; margin-top: 2px;">[توقيع وموافقة إلكترونية موثقة]</span>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0 0 6px 0; font-weight: bold; color: #f0f6fc;">ORLUXUS GROUP Ltd. • Verified Travel &amp; Excursions Partner</p>
      <p style="margin: 0 0 6px 0;">
        📍 <a href="https://maps.app.goo.gl/7tsNKEHJ8cEBcR9Q6" target="_blank" style="color: #d4af37; text-decoration: underline;">Taksim El-Nasr, Hurghada 1, Red Sea Governorate 1966533</a>
      </p>
      <p style="margin: 0; font-size: 11px; color: #8b949e;">This is an automated official booking voucher and digital contract agreement. Please keep this email as your valid digital ticket upon arrival.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Dispatch booking confirmation email to Guest and Company
 */
export async function sendBookingEmailServer(bookingData) {
  try {
    const settings = await getSettings();

    const activeSmtpHost = settings?.smtpHost || SMTP_HOST_DEFAULT;
    const activeSmtpPort = parseInt(settings?.smtpPort || SMTP_PORT_DEFAULT.toString(), 10);
    const activeSmtpUser = settings?.smtpUser || SMTP_USER_DEFAULT;
    const activeSmtpPass = settings?.smtpPass || SMTP_PASS_DEFAULT;
    const activeCompanyEmail = settings?.companyEmail || COMPANY_EMAIL_DEFAULT;

    const guestEmail = bookingData.email || bookingData.customerEmail;
    if (!guestEmail) {
      console.warn('[serverEmail] No guest email provided in booking data.');
      return { success: false, error: 'No guest email provided' };
    }

    if (!activeSmtpUser || !activeSmtpPass) {
      console.warn('[serverEmail] SMTP credentials not configured in settings. Email skipped.');
      return { success: false, error: 'SMTP credentials missing in settings' };
    }

    const transporter = nodemailer.createTransport({
      host: activeSmtpHost,
      port: activeSmtpPort,
      secure: activeSmtpPort === 465,
      auth: { user: activeSmtpUser, pass: activeSmtpPass },
      tls: { rejectUnauthorized: false }
    });

    const htmlContent = buildBookingInvoiceHTML(bookingData);
    const refCode = String(bookingData.txId || bookingData.id || Date.now().toString()).slice(-8).toUpperCase();
    const serviceTitle = bookingData.serviceName || bookingData.service || 'Travel Tour';
    const guestSubject = `[ORLUXUS] Official Booking Confirmation & Ticket — ${serviceTitle} (#${refCode})`;

    // 1. Send to GUEST (Customer)
    const guestMailOptions = {
      from: `"ORLUXUS Luxury Travel" <${activeSmtpUser}>`,
      to: guestEmail,
      replyTo: activeCompanyEmail,
      subject: guestSubject,
      html: htmlContent,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'High'
      }
    };

    const guestSendResult = await transporter.sendMail(guestMailOptions);
    console.log('[serverEmail] Guest confirmation sent to:', guestEmail, 'MessageId:', guestSendResult.messageId);

    // 2. Send to COMPANY (Admin Gmail)
    const companyMailOptions = {
      from: `"ORLUXUS Bookings" <${activeSmtpUser}>`,
      to: activeCompanyEmail,
      subject: `[NEW CONFIRMED BOOKING] ${bookingData.customerName || bookingData.customer} | ${serviceTitle}`,
      html: htmlContent
    };

    await transporter.sendMail(companyMailOptions);
    console.log('[serverEmail] Company copy sent to:', activeCompanyEmail);

    return { success: true, messageId: guestSendResult.messageId };
  } catch (error) {
    console.error('[serverEmail] Error sending booking confirmation email:', error);
    return { success: false, error: error.message };
  }
}
