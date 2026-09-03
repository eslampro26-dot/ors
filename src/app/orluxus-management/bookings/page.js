'use client';

import { useState, useEffect } from 'react';
import { getBookings, updateBookingStatus, getAgents } from '@/lib/db';

export default function AdminBookings() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('All Cities');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [agentFilter, setAgentFilter] = useState('All Agents');
  const [bookings, setBookings] = useState([]);
  const [agents, setAgents] = useState([]);

  // Receipt Modal State
  const [receiptModal, setReceiptModal] = useState({
    isOpen: false,
    url: '',
    booking: null
  });
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    try {
      const bookingsData = await getBookings();
      const agentsData = await getAgents();
      setBookings(bookingsData || []);
      setAgents(agentsData || []);
    } catch (e) {
      console.error('Error loading admin bookings', e);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-refresh every 5 seconds to show new bookings in realtime
    const interval = setInterval(() => {
      loadData();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Export Bookings to CSV (Excel compatible with UTF-8 BOM)
  const handleExportCSV = () => {
    const headers = ['Booking ID', 'Date', 'Guest Name', 'Phone Number', 'Service Requested', 'City', 'Agent', 'Promo Code', 'Original Price', 'Discount Amount', 'Final Amount', 'Payment Method', 'Status', 'Receipt URL'];
    const rows = filteredBookings.map(b => [
      b.id,
      b.date,
      b.customer,
      `"${b.phone}"`,
      b.service,
      b.city,
      b.agentName || 'Direct (No Agent)',
      b.promoCode || 'None',
      `${b.currency || '€'}${b.originalAmount || b.finalAmount}`,
      `${b.currency || '€'}${b.discountAmount || 0}`,
      `${b.currency || '€'}${b.finalAmount}`,
      b.paymentType === 'cash' || b.paymentType === 'onsite' ? 'Cash' : (b.paymentType === 'card' ? 'Card' : (b.paymentType === 'bank_transfer' ? 'Bank Transfer' : 'PayPal')),
      b.status,
      b.receiptUrl || 'None'
    ]);

    const BOM = "\uFEFF";
    const csvContent = BOM + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ORLUXUS_Bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Map English display values <-> Arabic DB values
  const STATUS_EN_TO_AR = {
    'Confirmed': 'مؤكد',
    'Pending': 'قيد الانتظار',
    'Awaiting Bank Confirmation': 'في انتظار تأكيد الدفع',
    'Completed': 'مكتمل',
    'Cancelled': 'ملغي',
    'Rejected': 'مرفوض',
    'Failed': 'فاشل',
  };
  const STATUS_AR_TO_EN = {
    'مؤكد': 'Confirmed',
    'قيد الانتظار': 'Pending',
    'في انتظار تأكيد الدفع': 'Awaiting Bank Confirmation',
    'مكتمل': 'Completed',
    'ملغي': 'Cancelled',
    'مرفوض': 'Rejected',
    'فاشل': 'Failed',
  };
  const toArStatus = (en) => STATUS_EN_TO_AR[en] || en;
  const toEnStatus = (ar) => STATUS_AR_TO_EN[ar] || ar;

  // Quick Confirm Bank Payment
  const handleConfirmBankPayment = async (bookingId) => {
    if (!confirm('Are you sure you want to verify and CONFIRM this bank payment? This will issue a verified confirmation email to the guest.')) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch('/api/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'confirm', bookingId })
      });
      if (res.ok) {
        alert('✅ Bank payment verified and booking confirmed successfully!');
        setReceiptModal({ isOpen: false, url: '', booking: null });
        loadData();
      } else {
        alert('❌ Failed to confirm payment!');
      }
    } catch (e) {
      console.error('Error confirming payment:', e);
      alert('❌ Error during payment confirmation');
    } finally {
      setActionLoading(false);
    }
  };

  // Quick Reject Bank Payment
  const handleRejectBankPayment = async (bookingId) => {
    const reason = prompt('Please enter the rejection reason (e.g. Receipt unreadable, Amount mismatch):', 'Payment receipt could not be verified');
    if (reason === null) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', bookingId, rejectionReason: reason })
      });
      if (res.ok) {
        alert('⚠️ Booking payment marked as rejected.');
        setReceiptModal({ isOpen: false, url: '', booking: null });
        loadData();
      } else {
        alert('❌ Failed to reject payment!');
      }
    } catch (e) {
      console.error('Error rejecting payment:', e);
      alert('❌ Error during payment rejection');
    } finally {
      setActionLoading(false);
    }
  };

  // Change Booking Status
  const handleStatusChange = async (id, newStatus) => {
    const arStatus = toArStatus(newStatus);
    try {
      let success = false;
      try {
        success = await updateBookingStatus(id, arStatus);
      } catch (e) {
        console.warn('Direct update failed, falling back to API route:', e);
      }

      if (!success) {
        const res = await fetch('/api/bookings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status: arStatus })
        });
        const data = await res.json();
        success = data?.success || res.ok;
      }

      if (success) {
        alert(`Booking status updated to ${newStatus} successfully!`);
        await loadData();
      } else {
        alert('Failed to update booking status!');
      }
    } catch (err) {
      console.error('Error updating booking status:', err);
      alert('An error occurred while updating booking status!');
    }
  };

  // Manual Send/Resend Email Ticket to Guest
  const handleSendTicketEmail = async (booking) => {
    if (!booking.email) {
      alert('⚠️ هذا الحجز لا يحتوي على بريد إلكتروني للعميل / No customer email found in this booking.');
      return;
    }
    
    setActionLoading(true);
    try {
      const res = await fetch('/api/send-booking-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: booking.customer || booking.customerName || 'Valued Guest',
          email: booking.email,
          phone: booking.phone || '',
          whatsapp: booking.whatsapp || booking.phone || '',
          date: booking.date || new Date().toISOString().split('T')[0],
          travelers: booking.travelers || 1,
          children: booking.children || 0,
          infants: booking.infants || 0,
          serviceName: booking.service || booking.serviceName || 'ORLUXUS VIP Excursion',
          originalAmount: booking.originalAmount || booking.finalAmount || 0,
          discountAmount: booking.discountAmount || 0,
          finalAmount: booking.finalAmount || 0,
          paymentType: booking.paymentType || 'Confirmed',
          status: booking.status || 'Confirmed',
          txId: booking.txId || booking.id,
          extras: booking.extras || '',
          pickupLocation: booking.pickupLocation || '',
          promoCode: booking.promoCode || '',
          agentName: booking.agentName || '',
          specialRequests: booking.specialRequests || '',
          adultPrice: booking.adultPrice,
          childPrice: booking.childPrice,
          infantPrice: booking.infantPrice
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(`✅ تم إرسال تذكرة وفاتورة الحجز بنجاح إلى بريد العميل:\n${booking.email}`);
      } else {
        alert(`❌ تعذر إرسال الإيميل: ${data.error || 'يرجى مراجعة إعدادات الـ SMTP'}`);
      }
    } catch (e) {
      console.error('Error sending ticket email:', e);
      alert('❌ حدث خطأ أثناء إرسال البريد الإلكتروني.');
    } finally {
      setActionLoading(false);
    }
  };

  // Print Digital Agreement
  const handlePrintAgreement = async (booking) => {
    // 1. Fetch custom terms from settings BEFORE opening popup window
    let customTermsAr = '';
    let customTermsEn = '';
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        const s = data.settings || data;
        customTermsAr = s.customTermsAr || s.termsAr || '';
        customTermsEn = s.customTermsEn || s.termsEn || '';
      }
    } catch (e) {
      console.warn('Could not load custom terms from settings, using default:', e);
    }

    // 2. Open print window AFTER async fetch is complete (prevents about:blank detached window)
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('الرجاء السماح بالنوافذ المنبثقة لطباعة الفاتورة / Please allow popups to print ticket');
      return;
    }

    // Always use English for invoice
    const isAr = false;
    const currSym = (booking.currency === 'EGP' || booking.currency === 'ج.م') ? 'EGP ' : (booking.currency || '€');
    const txId = (booking.txId || booking.id || '').toUpperCase();
    const dateFormatted = new Date(booking.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    const bookingTimeFormatted = new Date(booking.createdAt || Date.now()).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });

    const t = {
      title: 'BOOKING INVOICE',
      ref: 'Booking Reference',
      traveler: 'Traveler Details',
      name: 'Full Name',
      phone: 'Phone Number',
      email: 'Email Address',
      whatsapp: 'WhatsApp',
      info: 'Booking Information',
      service: 'Service Requested',
      city: 'City / Destination',
      date: 'Scheduled Date',
      travelersCount: 'Number of Travelers',
      pickup: 'Pickup Location',
      payment: 'Payment Method',
      payStatus: 'Payment Status',
      originalPrice: 'Original Price',
      discount: 'Discount Amount',
      finalPrice: 'Total Invoice Value',
      agent: 'Referred Agent',
      emergency: 'EMERGENCY',
      custService: 'CUSTOMER SERVICE',
      termsTitle: 'Terms & Conditions — Electronic Agreement',
      termsText: customTermsEn || `By completing this booking, ${booking.customer} hereby electronically confirms acceptance of ORLUXUS Terms & Conditions, Cancellation Policy (cancellations must be made 24+ hours in advance), and Data Protection Policy (GDPR compliant). This document constitutes a valid digital contract between the traveler and ORLUXUS GROUP Ltd. (Reg. No. 7291-B).`,
      disclaimer: `At ORLUXUS, we curate exceptional experiences through our network of trusted partners. Your selected experience is delivered by an authorized ORLUXUS partner, while we ensure a seamless booking journey, quality coordination, and dedicated guest support from reservation to completion.`,
      agreedBy: 'Digitally agreed by',
      timeLabel: 'Signing Time',
      refLabel: 'Signature Key',
      footerText: 'Thank you for choosing ORLUXUS. We wish you an amazing family trip.',
      statusLabel: {
        'Confirmed': 'Confirmed',
        'Pending': 'Pending',
        'Completed': 'Completed',
        'Cancelled': 'Cancelled'
      }[booking.status] || booking.status,
      methodLabel: {
        'cash': 'Cash',
        'onsite': 'Cash on Site',
        'card': 'Credit Card',
        'bank_transfer': 'Bank Transfer'
      }[booking.paymentType] || booking.paymentType || '—'
    };

    const agreementHTML = `
      <!DOCTYPE html>
      <html dir="ltr" lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${t.title} - ${txId}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px;
            color: #000000;
            background: #ffffff;
            line-height: 1.6;
            margin: 0;
          }
          .invoice-card {
            max-width: 800px;
            margin: 0 auto;
            border: 2px solid #000000;
            padding: 40px;
            background: #ffffff;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #000000;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo-area {
            display: flex;
            align-items: center;
            gap: 15px;
          }
          .logo-text h2 {
            margin: 0;
            font-size: 1.4rem;
            color: #000000;
            font-weight: 800;
            letter-spacing: 1px;
          }
          .ref-area {
            text-align: right;
          }
          .ref-area h3 {
            margin: 0 0 5px 0;
            color: #000000;
            font-size: 1.2rem;
          }
          .ref-area p {
            margin: 2px 0;
            font-size: 0.85rem;
            color: #000000;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 25px;
          }
          .info-block {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 0;
            border: 1px solid #000000;
          }
          .info-block h4 {
            margin: 0 0 10px 0;
            color: #000000;
            font-size: 0.95rem;
            border-bottom: 1px solid #000000;
            padding-bottom: 5px;
          }
          .info-block p {
            margin: 4px 0;
            font-size: 0.85rem;
            color: #000000;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
            border: 1px solid #000000;
          }
          th, td {
            padding: 10px 12px;
            border: 1px solid #000000;
            font-size: 0.88rem;
          }
          th {
            background: #000000;
            color: #ffffff;
            font-weight: bold;
          }
          .total-block {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f5f5f5;
            border: 2px solid #000000;
            padding: 15px 20px;
            border-radius: 0;
            margin-bottom: 25px;
          }
          .total-amount {
            font-size: 1.4rem;
            font-weight: bold;
            color: #000000;
          }
          .contacts {
            margin-bottom: 25px;
            background: #f5f5f5;
            padding: 15px;
            border-radius: 0;
            border: 1px solid #000000;
          }
          .contacts h4 {
            margin: 0 0 10px 0;
            color: #000000;
            font-size: 0.9rem;
            font-weight: bold;
          }
          .contacts-list {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
          }
          .contact-item {
            font-size: 0.85rem;
            font-weight: bold;
            color: #000000;
          }
          .contact-item a {
            color: #000000;
            text-decoration: none;
          }
          .agreement {
            border: 1px solid #000000;
            padding: 15px;
            border-radius: 0;
            font-size: 0.78rem;
            color: #000000;
            background: #f5f5f5;
          }
          .agreement h4 {
            margin: 0 0 8px 0;
            color: #000000;
            font-size: 0.85rem;
            font-weight: bold;
          }
          .signature-box {
            display: flex;
            justify-content: space-between;
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px dashed #000000;
            font-size: 0.8rem;
            color: #000000;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 0.85rem;
            color: #000000;
            font-weight: bold;
          }
          .badge {
            padding: 4px 8px;
            border-radius: 0;
            font-weight: bold;
            font-size: 0.75rem;
            border: 1px solid #000000;
          }
          .badge-green { background: #ffffff; color: #000000; }
          .badge-orange { background: #ffffff; color: #000000; }
          .badge-red { background: #ffffff; color: #000000; }
          @media print {
            body { padding: 0; }
            .invoice-card { border: 2px solid #000000; box-shadow: none; padding: 30px; }
            @page { margin: 0; size: auto; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-card">
          <div class="header">
            <div class="logo-area">
              <div class="logo-text">
                <h2>ORLUXUS MARKETING TOURISM AGENCY</h2>
              </div>
            </div>
            <div class="ref-area">
              <p>${t.ref}: <strong>${txId}</strong></p>
              <p>${dateFormatted}</p>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-block">
              <h4>${t.traveler}</h4>
              <p><strong>${t.name}:</strong> ${booking.customer}</p>
              <p><strong>${t.phone}:</strong> ${booking.phone}</p>
              ${booking.email ? `<p><strong>${t.email}:</strong> ${booking.email}</p>` : ''}
              <p><strong>${t.whatsapp}:</strong> ${booking.whatsapp || booking.phone}</p>
            </div>
            <div class="info-block">
              <h4>${t.info}</h4>
              <p><strong>${t.date}:</strong> ${booking.date}</p>
              <p><strong>${t.travelersCount}:</strong> ${booking.travelers}</p>
              ${booking.children ? `<p><strong>Children:</strong> ${booking.children}</p>` : ''}
              ${booking.infants ? `<p><strong>Infants:</strong> ${booking.infants}</p>` : ''}
              ${booking.pickupLocation ? `<p><strong>${t.pickup}:</strong> ${booking.pickupLocation}</p>` : ''}
              <p><strong>${t.payment}:</strong> ${t.methodLabel}</p>
              ${booking.agentName ? `<p><strong>Agent:</strong> ${booking.agentName}</p>` : ''}
              ${booking.promoCode ? `<p><strong>Promo Code:</strong> ${booking.promoCode}</p>` : ''}
              ${booking.specialRequests ? `<p><strong>Special Requests:</strong> ${booking.specialRequests}</p>` : ''}
              ${booking.extras ? `<p><strong>Additional Services:</strong> ${booking.extras}</p>` : ''}
            </div>
          </div>

          ${(booking.addons && booking.addons.length > 0) || booking.extrasDetails ? `
          <div class="info-grid" style="margin-top: 20px;">
            <div class="info-block" style="grid-column: span 2;">
              <h4>Additional Services / Extras</h4>
              ${booking.addons ? booking.addons.map(addon => `<p>• ${addon.name || addon.nameEn || addon.nameAr}: ${addon.price ? currSym + addon.price : ''}</p>`).join('') : ''}
              ${booking.extrasDetails ? (Array.isArray(booking.extrasDetails) ? booking.extrasDetails.map(ex => `<p>• ${ex.name || ex.title || ex}: ${ex.price ? currSym + ex.price : ''}</p>`).join('') : `<p>• ${booking.extrasDetails}</p>`) : ''}
            </div>
          </div>
          ` : ''}

          <table>
            <thead>
              <tr>
                <th>${t.service}</th>
                <th style="text-align: center; width: 80px;">Qty</th>
                <th style="text-align: right; width: 100px;">Rate</th>
                <th style="text-align: right; width: 100px;">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${booking.service}</strong> (${booking.city}) — Adults</td>
                <td style="text-align: center;">${booking.travelers || 1}</td>
                <td style="text-align: right;">${currSym}${Number(booking.adultPrice || (Number(booking.travelers || 1) > 1 ? (Number(booking.originalAmount || booking.finalAmount) - (Number(booking.children || 0) * Number(booking.childPrice || 0)) - (Number(booking.infants || 0) * Number(booking.infantPrice || 0))) / Number(booking.travelers || 1) : Number(booking.originalAmount || booking.finalAmount) - (Number(booking.children || 0) * Number(booking.childPrice || 0)) - (Number(booking.infants || 0) * Number(booking.infantPrice || 0)))).toFixed(2)}</td>
                <td style="text-align: right; font-weight: bold;">${currSym}${(Number(booking.travelers || 1) * Number(booking.adultPrice || ((Number(booking.originalAmount || booking.finalAmount) - (Number(booking.children || 0) * Number(booking.childPrice || 0)) - (Number(booking.infants || 0) * Number(booking.infantPrice || 0))) / Number(booking.travelers || 1)))).toFixed(2)}</td>
              </tr>
              ${(booking.children > 0 || Number(booking.children) > 0) ? `
                <tr>
                  <td><strong>Children Ticket</strong></td>
                  <td style="text-align: center;">${booking.children}</td>
                  <td style="text-align: right;">${currSym}${Number(booking.childPrice || 0).toFixed(2)}</td>
                  <td style="text-align: right; font-weight: bold;">${currSym}${(Number(booking.children || 0) * Number(booking.childPrice || 0)).toFixed(2)}</td>
                </tr>
              ` : ''}
              ${(booking.infants > 0 || Number(booking.infants) > 0) ? `
                <tr>
                  <td><strong>Infants Ticket</strong></td>
                  <td style="text-align: center;">${booking.infants}</td>
                  <td style="text-align: right;">${currSym}${Number(booking.infantPrice || 0).toFixed(2)}</td>
                  <td style="text-align: right; font-weight: bold;">${currSym}${(Number(booking.infants || 0) * Number(booking.infantPrice || 0)).toFixed(2)}</td>
                </tr>
              ` : ''}
              ${(() => {
                // Show extras row if person-based totals don't add up to originalAmount
                const adultP = Number(booking.adultPrice || 0);
                const childP = Number(booking.childPrice || 0);
                const infantP = Number(booking.infantPrice || 0);
                const adultQty = Number(booking.travelers || 1);
                const childQty = Number(booking.children || 0);
                const infantQty = Number(booking.infants || 0);
                const personTotal = (adultQty * adultP) + (childQty * childP) + (infantQty * infantP);
                const origAmt = Number(booking.originalAmount || booking.finalAmount || 0);
                const extrasAmt = origAmt - personTotal;
                if (extrasAmt > 0.01) {
                  const extrasLabel = booking.extras ? `Additional Services (${booking.extras})` : 'Additional Services / Extras';
                  return `<tr>
                  <td><strong>${extrasLabel}</strong></td>
                  <td style="text-align: center;">1</td>
                  <td style="text-align: right;">${currSym}${extrasAmt.toFixed(2)}</td>
                  <td style="text-align: right; font-weight: bold;">${currSym}${extrasAmt.toFixed(2)}</td>
                </tr>`;
                }
                return '';
              })()}
              ${booking.discountAmount > 0 ? `
                <tr style="color: #000000; background: #ffffff;">
                  <td><strong>Promo Discount</strong> ${booking.promoCode ? `(${booking.promoCode})` : ''}</td>
                  <td style="text-align: center;">-</td>
                  <td style="text-align: right;">-</td>
                  <td style="text-align: right; font-weight: bold;">-${currSym}${Number(booking.discountAmount).toFixed(2)}</td>
                </tr>
              ` : ''}
            </tbody>
          </table>

          <div class="total-block">
            <div>
              <span style="font-size: 0.85rem; color: #000000; display: block; margin-bottom: 4px;">${t.payStatus}</span>
              <span class="badge ${booking.status === 'Confirmed' || booking.status === 'Completed' ? 'badge-green' : booking.status === 'Cancelled' ? 'badge-red' : 'badge-orange'}">
                ${t.statusLabel}
              </span>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 0.85rem; color: #000000; display: block; margin-bottom: 4px;">${t.finalPrice}</span>
              <span class="total-amount">${currSym}${Number(booking.finalAmount).toFixed(2)}</span>
            </div>
          </div>

          <div class="contacts">
            <h4>${t.emergency} / ${t.custService}</h4>
            <div class="contacts-list">
              <div class="contact-item">EMERGENCY: <a href="tel:+201038820014">+201038820014</a></div>
              <div class="contact-item">CUSTOMER SERVICE: <a href="tel:+201038820019">+201038820019</a></div>
            </div>
          </div>

          <div class="agreement">
            <h4>${t.termsTitle}</h4>
            <p style="margin: 0 0 10px 0; line-height: 1.6;">${t.termsText}</p>
            <p style="margin: 0 0 12px 0; font-style: italic; border-top: 1px solid #000000; padding-top: 8px; line-height: 1.6;">${t.disclaimer}</p>
            <div class="signature-box">
              <span><strong>${t.agreedBy}:</strong> ${booking.customer}</span>
              <span><strong>${t.timeLabel}:</strong> ${bookingTimeFormatted}</span>
              <span><strong>${t.refLabel}:</strong> ${txId}</span>
            </div>
          </div>

          <div class="footer">
            ${t.footerText.replace('🌟', '')}
          </div>
        </div>
      </body>
      </html>
    `;
    printWindow.document.write(agreementHTML);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      try {
        printWindow.print();
      } catch (err) {
        console.error('Error triggering invoice print:', err);
      }
    }, 350);
  };

  // Filters
  const filteredBookings = bookings.filter(b => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (b.id || '').toLowerCase().includes(searchLower) ||
      (b.customer || '').toLowerCase().includes(searchLower) ||
      (b.phone || '').includes(searchTerm) ||
      (b.service || '').toLowerCase().includes(searchLower) ||
      (b.txId || '').toLowerCase().includes(searchLower) ||
      (b.customerLanguage || '').toLowerCase().includes(searchLower);

    const matchesCity = cityFilter === 'All Cities' || b.city === cityFilter;

    // Support both Arabic (DB stored) and English status values in filter
    const matchesStatus = statusFilter === 'All Statuses' || 
      b.status === statusFilter || 
      b.status === toArStatus(statusFilter) ||
      toEnStatus(b.status) === statusFilter;

    let matchesAgent = true;
    if (agentFilter !== 'All Agents') {
      if (agentFilter === 'Direct (No Agent)') {
        matchesAgent = !b.agentId;
      } else {
        matchesAgent = b.agentId?.toString() === agentFilter.toString();
      }
    }

    return matchesSearch && matchesCity && matchesStatus && matchesAgent;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)', textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ color: 'var(--text-primary)', fontWeight: '800' }}>Bookings &amp; Sales Management — ORLUXUS</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Track platform bookings, monitor discounts, referral codes, and export reports.</p>
        </div>
        <button 
          onClick={handleExportCSV} 
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem' }}
        >
          <span>⬇️</span> Export Filtered Bookings (CSV)
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
          <input 
            type="text" 
            placeholder="Search by booking ID, customer name, phone, or service..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.8rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              background: 'rgba(255,255,255,0.04)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          <select 
            value={agentFilter} 
            onChange={(e) => setAgentFilter(e.target.value)}
            style={{
              padding: '0.8rem 1.2rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              outline: 'none'
            }}
          >
            <option value="All Agents">All Agents</option>
            <option value="Direct (No Agent)">Direct (No Agent)</option>
            {agents.map(a => (
              <option key={a.id} value={a.id}>{a.name} (AG-{a.id})</option>
            ))}
          </select>

          <select 
            value={cityFilter} 
            onChange={(e) => setCityFilter(e.target.value)}
            style={{
              padding: '0.8rem 1.2rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              outline: 'none'
            }}
          >
            <option value="All Cities">All Cities</option>
            <option value="Sharm El Sheikh">Sharm El Sheikh</option>
            <option value="Hurghada">Hurghada</option>
            <option value="Marsa Alam">Marsa Alam</option>
            <option value="Dahab & El Sokhna">Dahab &amp; El Sokhna</option>
          </select>

          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.8rem 1.2rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              outline: 'none'
            }}
          >
            <option value="All Statuses">All Statuses</option>
            <option value="Awaiting Bank Confirmation">⏳ Awaiting Bank Confirmation</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Awaiting Bank Transfer Notice Banner */}
      {(() => {
        const pendingCount = bookings.filter(b => b.status === 'في انتظار تأكيد الدفع' || b.status === 'Awaiting Bank Confirmation').length;
        if (pendingCount === 0) return null;
        return (
          <div style={{
            background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))',
            border: '1px solid var(--gold-500)',
            borderRadius: '10px',
            padding: '1rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: '0 4px 15px rgba(212,175,55,0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.8rem' }}>🔔</span>
              <div>
                <strong style={{ color: 'var(--gold-400)', fontSize: '1.05rem', display: 'block' }}>
                  {pendingCount} Booking(s) Awaiting Bank Payment Confirmation
                </strong>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  يوجد {pendingCount} حجز عبر التحويل البنكي بانتظار مراجعة الإيصال وتأكيد الدفع
                </span>
              </div>
            </div>
            <button
              onClick={() => setStatusFilter('Awaiting Bank Confirmation')}
              className="btn btn-secondary btn-sm"
              style={{ background: 'var(--gold-500)', color: '#000', fontWeight: 'bold', border: 'none', padding: '6px 14px' }}
            >
              Filter Awaiting ({pendingCount}) →
            </button>
          </div>
        );
      })()}

      {/* Bookings Table */}
      <div className="glass-card animate-fade-in-up" style={{ padding: '2rem 1.5rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-subtle)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Booking ID</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Date</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Customer / Mobile</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Service &amp; Destination</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Agent</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Promo Code</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Total</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Payment</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Status</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => {
                const isBankTransfer = booking.paymentType === 'bank_transfer' || booking.paymentType === 'bank_transfer_custom';
                const isAwaitingConfirmation = booking.status === 'في انتظار تأكيد الدفع' || booking.status === 'Awaiting Bank Confirmation';

                return (
                  <tr key={booking.id} style={{ 
                    borderBottom: '1px solid rgba(255,255,255,0.06)', 
                    background: isAwaitingConfirmation ? 'rgba(212,175,55,0.04)' : 'transparent',
                    transition: 'background var(--transition-fast)' 
                  }} className="table-row-hover">
                    <td style={{ padding: '1.2rem 1rem', fontFamily: 'var(--font-en)', fontWeight: 'bold' }}>
                      {booking.id}
                      {booking.bookingRefCode && (
                        <div style={{ fontSize: '10px', color: '#93c5fd', marginTop: '2px' }}>
                          Ref: {booking.bookingRefCode}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1.2rem 1rem' }}>{booking.date}</td>
                    <td style={{ padding: '1.2rem 1rem' }}>
                      <div style={{ fontWeight: '600' }}>{booking.customer}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-en)', marginTop: '2px' }}>{booking.phone}</div>
                      {booking.customerLanguage && (
                        <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '4px', color: 'var(--gold-400)', fontWeight: 'bold' }}>
                          🌐 {booking.customerLanguage === 'ar' ? 'Arabic' : booking.customerLanguage === 'de' ? 'Deutsch' : booking.customerLanguage === 'fr' ? 'Français' : booking.customerLanguage === 'it' ? 'Italiano' : booking.customerLanguage === 'ru' ? 'Русский' : booking.customerLanguage === 'es' ? 'Español' : booking.customerLanguage === 'zh' ? 'Chinese' : booking.customerLanguage === 'ja' ? 'Japanese' : booking.customerLanguage === 'tr' ? 'Türkçe' : booking.customerLanguage.toUpperCase()}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1.2rem 1rem' }}>
                      <strong>{booking.service}</strong>
                      <br/>
                      <span style={{ fontSize: '11px', color: 'var(--gold-500)', background: 'rgba(251,191,36,0.08)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>
                        📍 {booking.city}
                      </span>
                      {booking.specialRequests && (
                        <div style={{ fontSize: '11px', color: '#93c5fd', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>⭐</span> <span>{booking.specialRequests}</span>
                        </div>
                      )}
                      {booking.extras && (
                        <div style={{ fontSize: '11px', color: '#34d399', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>🎁</span> <span>{booking.extras}</span>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1.2rem 1rem', color: 'var(--text-secondary)' }}>
                      {booking.agentId ? (
                        <span style={{ fontWeight: 'bold' }}>
                          👤 {booking.agentName}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic', fontSize: '11px' }}>Direct (No Agent)</span>
                      )}
                    </td>
                    <td>
                      {booking.promoCode ? (
                        <span style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', color: 'var(--coral-400)' }}>
                          🎫 {booking.promoCode}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: '1.2rem 1rem', fontFamily: 'var(--font-en)' }}>
                      {booking.discountAmount > 0 ? (
                        <div>
                          <span style={{ textDecoration: 'line-through', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                            €{booking.originalAmount}
                          </span>
                          <br/>
                          <strong style={{ color: 'var(--gold-400)', fontSize: '1.05rem' }}>
                            €{booking.finalAmount}
                          </strong>
                          <span style={{ fontSize: '9px', color: 'var(--coral-400)', display: 'block' }}>
                            (Saved €{booking.discountAmount})
                          </span>
                        </div>
                      ) : (
                        <strong style={{ color: 'var(--text-primary)' }}>
                          €{booking.finalAmount}
                        </strong>
                      )}
                    </td>
                    <td style={{ padding: '1.2rem 1rem' }}>
                      {isBankTransfer ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ 
                            fontSize: '11px', 
                            fontWeight: 'bold',
                            color: 'var(--gold-400)',
                            background: 'rgba(212,175,55,0.12)',
                            border: '1px solid rgba(212,175,55,0.3)',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            display: 'inline-block',
                            whiteSpace: 'nowrap'
                          }}>
                            🏛️ Bank Transfer
                          </span>
                          {booking.receiptBankName && (
                            <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                              {booking.receiptBankName}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ 
                          fontSize: '11px', 
                          fontWeight: 'bold',
                          color: booking.paymentType === 'cash' || booking.paymentType === 'onsite' ? 'var(--gold-400)' : (booking.paymentType === 'card' ? '#3b82f6' : '#a855f7'),
                          background: booking.paymentType === 'cash' || booking.paymentType === 'onsite' ? 'rgba(251,191,36,0.08)' : (booking.paymentType === 'card' ? 'rgba(59,130,246,0.08)' : 'rgba(168,85,247,0.08)'),
                          border: booking.paymentType === 'cash' || booking.paymentType === 'onsite' ? '1px solid rgba(251,191,36,0.2)' : (booking.paymentType === 'card' ? '1px solid rgba(59,130,246,0.2)' : '1px solid rgba(168,85,247,0.2)'),
                          padding: '3px 8px',
                          borderRadius: '6px',
                          display: 'inline-block',
                          whiteSpace: 'nowrap'
                        }}>
                          {booking.paymentType === 'cash' || booking.paymentType === 'onsite' ? '💵 Cash' : (booking.paymentType === 'card' ? '💳 Card' : '🅿️ PayPal')}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1.2rem 1rem' }}>
                      {isAwaitingConfirmation ? (
                        <span style={{
                          background: 'rgba(212,175,55,0.2)',
                          border: '1px solid var(--gold-500)',
                          color: 'var(--gold-400)',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: '800',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          whiteSpace: 'nowrap'
                        }}>
                          <span style={{ animation: 'pulse 1.5s infinite' }}>⏳</span> Awaiting Verification
                        </span>
                      ) : (
                        <span className={`badge badge-${booking.status === 'Confirmed' || booking.status === 'مؤكد' ? 'emerald' : booking.status === 'Completed' || booking.status === 'مكتمل' ? 'ocean' : booking.status === 'Cancelled' || booking.status === 'ملغي' || booking.status === 'مرفوض' ? 'coral' : 'gold'}`}>
                          {toEnStatus(booking.status)}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1.2rem 1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* View Receipt Button */}
                        {booking.receiptUrl && (
                          <button
                            type="button"
                            onClick={() => setReceiptModal({ isOpen: true, url: booking.receiptUrl, booking })}
                            title="View Bank Receipt"
                            style={{
                              padding: '5px 10px',
                              background: 'rgba(212,175,55,0.2)',
                              color: 'var(--gold-400)',
                              border: '1px solid var(--gold-500)',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}
                          >
                            📎 Receipt
                          </button>
                        )}

                        {/* Quick Confirm/Reject Buttons for Pending Bank Payments */}
                        {isAwaitingConfirmation && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleConfirmBankPayment(booking.id)}
                              disabled={actionLoading}
                              title="Confirm Payment"
                              style={{
                                padding: '5px 10px',
                                background: '#10b981',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                              }}
                            >
                              ✓ Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectBankPayment(booking.id)}
                              disabled={actionLoading}
                              title="Reject Receipt"
                              style={{
                                padding: '5px 8px',
                                background: 'rgba(239,68,68,0.2)',
                                color: '#ef4444',
                                border: '1px solid rgba(239,68,68,0.4)',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.8rem'
                              }}
                            >
                              ✕
                            </button>
                          </>
                        )}

                        {/* Send Ticket Email to Guest */}
                        <button
                          type="button"
                          onClick={() => handleSendTicketEmail(booking)}
                          disabled={actionLoading}
                          title="Send/Resend Official Ticket Email to Customer"
                          style={{
                            padding: '5px 10px',
                            background: 'rgba(16,185,129,0.15)',
                            color: '#10b981',
                            border: '1px solid #10b981',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          📧 Ticket
                        </button>

                        {/* Print Invoice */}
                        <button
                          onClick={() => handlePrintAgreement(booking)}
                          title="Print Digital Agreement"
                          style={{
                            padding: '5px 10px',
                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          📄 Print
                        </button>

                        {/* Status Select */}
                        <select 
                          value={STATUS_AR_TO_EN[booking.status] || booking.status} 
                          onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                          style={{
                            padding: '5px 8px',
                            borderRadius: '4px',
                            border: '1px solid var(--border-medium)',
                            background: 'var(--bg-primary)',
                            color: 'var(--text-primary)',
                            fontSize: '11px',
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="Pending">Pending</option>
                          <option value="Awaiting Bank Confirmation">Awaiting Bank Confirmation</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan="10" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    ❌ No bookings match the current search or filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Lightbox Modal */}
      {receiptModal.isOpen && receiptModal.booking && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99999,
          backdropFilter: 'blur(5px)',
          padding: '1rem'
        }}>
          <div style={{
            background: '#121620',
            border: '1px solid var(--gold-500)',
            borderRadius: '12px',
            padding: '1.8rem',
            width: '100%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.7)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.8rem' }}>
              <div>
                <h3 style={{ color: 'var(--gold-400)', margin: 0, fontSize: '1.2rem' }}>
                  📎 Bank Payment Receipt (إيصال التحويل)
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                  Booking #{receiptModal.booking.id} — {receiptModal.booking.customer}
                </span>
              </div>
              <button 
                onClick={() => setReceiptModal({ isOpen: false, url: '', booking: null })}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Booking Details Summary */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '8px',
              padding: '1rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.6rem',
              fontSize: '0.85rem'
            }}>
              <div><strong style={{ color: 'var(--text-tertiary)' }}>Guest:</strong> {receiptModal.booking.customer}</div>
              <div><strong style={{ color: 'var(--text-tertiary)' }}>Phone:</strong> {receiptModal.booking.phone}</div>
              <div><strong style={{ color: 'var(--text-tertiary)' }}>Amount to Verify:</strong> <span style={{ color: 'var(--gold-400)', fontWeight: 'bold', fontSize: '1rem' }}>€{receiptModal.booking.finalAmount}</span></div>
              <div><strong style={{ color: 'var(--text-tertiary)' }}>Target Bank:</strong> {receiptModal.booking.receiptBankName || 'Direct Transfer'}</div>
              <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(59,130,246,0.08)', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(59,130,246,0.2)' }}>
                <strong style={{ color: '#93c5fd' }}>📌 Booking Ref to search in Bank:</strong>
                <span style={{ color: '#fff', fontFamily: 'var(--font-en)', fontWeight: 'bold', fontSize: '0.95rem' }}>
                  {receiptModal.booking.bookingRefCode || receiptModal.booking.id}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(receiptModal.booking.bookingRefCode || receiptModal.booking.id);
                    alert('📋 Booking Reference Code copied! You can now search for it in your Bank statement.');
                  }}
                  style={{ background: 'rgba(59,130,246,0.25)', border: '1px solid #3b82f6', color: '#93c5fd', borderRadius: '4px', padding: '2px 8px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Copy Ref 📋
                </button>
              </div>
              {receiptModal.booking.receiptTxRef && (
                <div style={{ gridColumn: 'span 2' }}>
                  <strong style={{ color: 'var(--text-tertiary)' }}>Client Transfer Note:</strong> {receiptModal.booking.receiptTxRef}
                </div>
              )}
            </div>

            {/* Receipt Preview (Image or PDF) */}
            <div style={{
              background: '#0a0d14',
              borderRadius: '8px',
              border: '1px solid var(--border-medium)',
              padding: '0.5rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '250px',
              maxHeight: '400px',
              overflow: 'hidden'
            }}>
              {receiptModal.url?.endsWith('.pdf') ? (
                <iframe
                  src={receiptModal.url}
                  style={{ width: '100%', height: '380px', border: 'none' }}
                  title="PDF Receipt Viewer"
                />
              ) : (
                <img
                  src={receiptModal.url}
                  alt="Bank Transfer Receipt"
                  style={{ maxWidth: '100%', maxHeight: '380px', objectFit: 'contain', borderRadius: '4px' }}
                />
              )}
            </div>

            {/* Actions Bar */}
            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
              <a
                href={receiptModal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ flex: 1, textAlign: 'center', padding: '10px' }}
              >
                🔍 Open Full Size
              </a>
              <button
                type="button"
                onClick={() => handleRejectBankPayment(receiptModal.booking.id)}
                disabled={actionLoading}
                className="btn btn-secondary"
                style={{ color: '#ef4444', borderColor: '#ef4444', padding: '10px 16px' }}
              >
                ✕ Reject Receipt
              </button>
              <button
                type="button"
                onClick={() => handleConfirmBankPayment(receiptModal.booking.id)}
                disabled={actionLoading}
                className="btn btn-primary"
                style={{ flex: 1, padding: '10px', fontWeight: 'bold' }}
              >
                ✓ Confirm &amp; Send Invoice Email
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
