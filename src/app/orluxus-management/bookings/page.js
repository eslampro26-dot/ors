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
  }, []);

  // Export Bookings to CSV (Excel compatible with UTF-8 BOM)
  const handleExportCSV = () => {
    const headers = ['Booking ID', 'Date', 'Guest Name', 'Phone Number', 'Service Requested', 'City', 'Agent', 'Promo Code', 'Original Price', 'Discount Amount', 'Final Amount', 'Payment Method', 'Status'];
    const rows = filteredBookings.map(b => [
      b.id,
      b.date,
      b.customer,
      `"${b.phone}"`,
      b.service,
      b.city,
      b.agentName || 'Direct (No Agent)',
      b.promoCode || 'None',
      `€${b.originalAmount || b.finalAmount}`,
      `€${b.discountAmount || 0}`,
      `€${b.finalAmount}`,
      b.paymentType === 'cash' || b.paymentType === 'onsite' ? 'Cash' : (b.paymentType === 'card' ? 'Card' : 'PayPal'),
      b.status
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
    'Completed': 'مكتمل',
    'Cancelled': 'ملغي',
    'Failed': 'فاشل',
  };
  const STATUS_AR_TO_EN = {
    'مؤكد': 'Confirmed',
    'قيد الانتظار': 'Pending',
    'مكتمل': 'Completed',
    'ملغي': 'Cancelled',
    'فاشل': 'Failed',
  };
  const toArStatus = (en) => STATUS_EN_TO_AR[en] || en;
  const toEnStatus = (ar) => STATUS_AR_TO_EN[ar] || ar;

  // Change Booking Status
  const handleStatusChange = async (id, newStatus) => {
    // Convert English UI value → Arabic DB value before saving
    const arStatus = toArStatus(newStatus);
    try {
      const success = await updateBookingStatus(id, arStatus);
      if (success) {
        alert(`Booking ${id} status updated to ${newStatus} successfully!`);
        await loadData();
      } else {
        alert('Failed to update booking status!');
      }
    } catch (err) {
      console.error('Error updating booking status:', err);
      alert('An error occurred while updating booking status!');
    }
  };

  // Print Digital Agreement
  const handlePrintAgreement = (booking) => {
    const printWindow = window.open('', '_blank');
    const bLang = booking.customerLanguage || 'en';
    const isAr = bLang === 'ar';
    const txId = (booking.txId || booking.id || '').toUpperCase();
    const dateFormatted = new Date(booking.createdAt || Date.now()).toLocaleDateString(isAr ? 'ar-EG' : 'en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    const bookingTimeFormatted = new Date(booking.createdAt || Date.now()).toLocaleString(isAr ? 'ar-EG' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });

    const t = {
      title: isAr ? 'فاتورة الحجز الإلكترونية' : 'Booking Invoice',
      ref: isAr ? 'رقم المرجع' : 'Booking Ref',
      traveler: isAr ? 'بيانات المسافر' : 'Traveler Details',
      name: isAr ? 'الاسم بالكامل' : 'Full Name',
      phone: isAr ? 'رقم الجوال' : 'Phone Number',
      email: isAr ? 'البريد الإلكتروني' : 'Email Address',
      whatsapp: isAr ? 'الواتساب' : 'WhatsApp',
      info: isAr ? 'معلومات الحجز' : 'Booking Info',
      service: isAr ? 'الخدمة المطلوبة' : 'Service Requested',
      city: isAr ? 'الوجهة / المدينة' : 'City',
      date: isAr ? 'التاريخ المجدول' : 'Scheduled Date',
      travelersCount: isAr ? 'عدد المسافرين' : 'Travelers Count',
      pickup: isAr ? 'موقع الالتقاط' : 'Pickup Location',
      payment: isAr ? 'طريقة الدفع' : 'Payment Method',
      payStatus: isAr ? 'حالة الدفع' : 'Payment Status',
      originalPrice: isAr ? 'السعر الأصلي' : 'Original Price',
      discount: isAr ? 'قيمة الخصم' : 'Discount',
      finalPrice: isAr ? 'إجمالي الحساب' : 'Total Invoice Value',
      agent: isAr ? 'الوكيل المحيل' : 'Referred Agent',
      emergency: isAr ? 'خط طوارئ' : 'EMERGENCY',
      custService: isAr ? 'خدمة العملاء' : 'CUSTOMER SERVICE',
      termsTitle: isAr ? 'الشروط والأحكام — الاتفاقية الإلكترونية' : 'Terms & Conditions — Electronic Agreement',
      termsText: isAr 
        ? `باستكمال هذا الحجز، يؤكد ${booking.customer} إلكترونياً قبوله لشروط وأحكام ORLUXUS وسياسة الإلغاء (يجب الإلغاء قبل 24 ساعة) وسياسة حماية البيانات (GDPR). يُعدّ هذا المستند عقداً رقمياً صالحاً مع ORLUXUS GROUP Ltd. (رقم السجل: 7291-B).`
        : `By completing this booking, ${booking.customer} hereby electronically confirms acceptance of ORLUXUS Terms & Conditions, Cancellation Policy (cancellations must be made 24+ hours in advance), and Data Protection Policy (GDPR compliant). This document constitutes a valid digital contract between the traveler and ORLUXUS GROUP Ltd. (Reg. No. 7291-B).`,
      disclaimer: isAr
        ? `في ORLUXUS، نقوم بتنظيم تجارب استثنائية من خلال شبكتنا من الشركاء الموثوقين. يتم تقديم تجربتك المختارة من قبل شريك ORLUXUS المعتمد، بينما نضمن لك رحلة حجز سلسة، وتنسيقاً متميزاً، ودعماً مخصصاً للضيوف من الحجز وحتى إتمام الرحلة.`
        : `At ORLUXUS, we curate exceptional experiences through our network of trusted partners. Your selected experience is delivered by an authorized ORLUXUS partner, while we ensure a seamless booking journey, quality coordination, and dedicated guest support from reservation to completion.`,
      agreedBy: isAr ? 'تمت الموافقة إلكترونياً بواسطة' : 'Digitally agreed by',
      timeLabel: isAr ? 'وقت التوقيع' : 'Signing Time',
      refLabel: isAr ? 'رمز التوقيع' : 'Signature Key',
      footerText: isAr ? 'شكراً لاختيارك ORLUXUS. نتمنى لك رحلة عائلية رائعة. 🌟' : 'Thank you for choosing ORLUXUS. We wish you an amazing family trip. 🌟',
      statusLabel: {
        'Confirmed': 'Confirmed',
        'Pending': 'Pending',
        'Completed': 'Completed',
        'Cancelled': 'Cancelled'
      }[booking.status] || booking.status,
      methodLabel: {
        'cash': 'Cash (💵)',
        'onsite': 'Cash on Site',
        'card': 'Credit Card',
        'bank_transfer': 'Bank Transfer'
      }[booking.paymentType] || booking.paymentType || '—'
    };

    const agreementHTML = `
      <!DOCTYPE html>
      <html dir="${isAr ? 'rtl' : 'ltr'}" lang="${bLang}">
      <head>
        <meta charset="UTF-8">
        <title>${t.title} - ${txId}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px;
            color: #1e293b;
            background: #ffffff;
            line-height: 1.6;
            margin: 0;
          }
          .invoice-card {
            max-width: 800px;
            margin: 0 auto;
            border: 2px solid #cbd5e1;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 20px;
            margin-bottom: 25px;
          }
          .logo-area {
            display: flex;
            align-items: center;
            gap: 15px;
          }
          .logo-text h2 {
            margin: 0;
            font-size: 1.8rem;
            color: #b45309;
            letter-spacing: 2px;
          }
          .logo-text span {
            font-size: 0.8rem;
            color: #64748b;
          }
          .ref-area {
            text-align: ${isAr ? 'left' : 'right'};
          }
          .ref-area h3 {
            margin: 0 0 5px 0;
            color: #1e293b;
          }
          .ref-area p {
            margin: 0;
            font-size: 0.85rem;
            color: #64748b;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 25px;
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
          }
          .info-block h4 {
            margin: 0 0 10px 0;
            color: #b45309;
            font-size: 0.95rem;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 4px;
          }
          .info-block p {
            margin: 4px 0;
            font-size: 0.88rem;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
          }
          th, td {
            padding: 10px 12px;
            border: 1px solid #e2e8f0;
            font-size: 0.88rem;
          }
          th {
            background: #f1f5f9;
            color: #334155;
          }
          .total-block {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #fffbe6;
            border: 1px solid #ffe58f;
            padding: 15px 20px;
            border-radius: 8px;
            margin-bottom: 25px;
          }
          .total-amount {
            font-size: 1.4rem;
            font-weight: bold;
            color: #b45309;
          }
          .contacts {
            margin-bottom: 25px;
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #b45309;
          }
          .contacts h4 {
            margin: 0 0 10px 0;
            color: #1e293b;
            font-size: 0.9rem;
          }
          .contacts-list {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
          }
          .contact-item {
            font-size: 0.85rem;
            font-weight: bold;
          }
          .contact-item a {
            color: #2563eb;
            text-decoration: none;
          }
          .agreement {
            border: 1px solid #e2e8f0;
            padding: 15px;
            border-radius: 8px;
            font-size: 0.78rem;
            color: #475569;
            background: #fafafa;
          }
          .agreement h4 {
            margin: 0 0 8px 0;
            color: #1e293b;
            font-size: 0.85rem;
          }
          .signature-box {
            display: flex;
            justify-content: space-between;
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px dashed #cbd5e1;
            font-size: 0.8rem;
            color: #0f172a;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 0.85rem;
            color: #64748b;
            font-weight: bold;
          }
          .badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 0.75rem;
          }
          .badge-green { background: #dcfce7; color: #15803d; }
          .badge-orange { background: #ffedd5; color: #c2410c; }
          .badge-red { background: #fee2e2; color: #b91c1c; }
          @media print {
            body { padding: 0; }
            .invoice-card { border: none; box-shadow: none; padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-card">
          <div class="header">
            <div class="logo-area">
              <img src="/logo_gold.png" alt="Orluxus" style="height: 48px; width: auto;" onerror="this.style.display='none';" />
              <div class="logo-text">
                <h2>ORLUXUS</h2>
                <span>Premium Egypt Travel &amp; Tourism</span>
              </div>
            </div>
            <div class="ref-area">
              <h3>${t.title}</h3>
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
              ${booking.pickupLocation ? `<p><strong>${t.pickup}:</strong> ${booking.pickupLocation}</p>` : ''}
              <p><strong>${t.payment}:</strong> ${t.methodLabel}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>${t.service}</th>
                <th style="text-align: center; width: 80px;">${isAr ? 'الكمية' : 'Qty'}</th>
                <th style="text-align: right; width: 100px;">${isAr ? 'السعر' : 'Rate'}</th>
                <th style="text-align: right; width: 100px;">${isAr ? 'الإجمالي' : 'Total'}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${booking.service}</strong> (${booking.city})</td>
                <td style="text-align: center;">${booking.travelers}</td>
                <td style="text-align: right;">€${(Number(booking.originalAmount || booking.finalAmount) / (Number(booking.travelers) || 1)).toFixed(2)}</td>
                <td style="text-align: right; font-weight: bold;">€${Number(booking.originalAmount || booking.finalAmount).toFixed(2)}</td>
              </tr>
              ${booking.discountAmount > 0 ? `
                <tr style="color: #dc2626; background: #fef2f2;">
                  <td><strong>${isAr ? 'خصم الكود الترويجي' : 'Promo Discount'}</strong> ${booking.promoCode ? `(${booking.promoCode})` : ''}</td>
                  <td style="text-align: center;">-</td>
                  <td style="text-align: right;">-</td>
                  <td style="text-align: right; font-weight: bold;">-€${Number(booking.discountAmount).toFixed(2)}</td>
                </tr>
              ` : ''}
            </tbody>
          </table>

          <div class="total-block">
            <div>
              <span style="font-size: 0.85rem; color: #64748b; display: block; margin-bottom: 4px;">${t.payStatus}</span>
              <span class="badge ${booking.status === 'Confirmed' || booking.status === 'Completed' ? 'badge-green' : booking.status === 'Cancelled' ? 'badge-red' : 'badge-orange'}">
                ${t.statusLabel}
              </span>
            </div>
            <div style="text-align: ${isAr ? 'left' : 'right'};">
              <span style="font-size: 0.85rem; color: #64748b; display: block; margin-bottom: 4px;">${t.finalPrice}</span>
              <span class="total-amount">€${Number(booking.finalAmount).toFixed(2)}</span>
            </div>
          </div>

          <div class="contacts">
            <h4>📞 ${t.emergency} / ${t.custService}</h4>
            <div class="contacts-list">
              <div class="contact-item">🚨 ${isAr ? 'طوارئ' : 'EMERGENCY'}: <a href="tel:+201038820014">+201038820014</a></div>
              <div class="contact-item">💬 ${isAr ? 'خدمة العملاء' : 'CUSTOMER SERVICE'}: <a href="tel:+201038820019">+201038820019</a></div>
            </div>
          </div>

          <div class="agreement">
            <h4>📋 ${t.termsTitle}</h4>
            <p style="margin: 0 0 10px 0; line-height: 1.6;">${t.termsText}</p>
            <p style="margin: 0 0 12px 0; font-style: italic; border-top: 1px solid #e2e8f0; padding-top: 8px; line-height: 1.6;">${t.disclaimer}</p>
            <div class="signature-box">
              <span>✍️ <strong>${t.agreedBy}:</strong> ${booking.customer}</span>
              <span>🕐 <strong>${t.timeLabel}:</strong> ${bookingTimeFormatted}</span>
              <span>🔑 <strong>${t.refLabel}:</strong> ${txId}</span>
            </div>
          </div>

          <div class="footer">
            ${t.footerText}
          </div>
        </div>
      </body>
      </html>
    `;
    printWindow.document.write(agreementHTML);
    printWindow.document.close();
    printWindow.print();
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
            <option value="جميع الوكلاء">All Agents</option>
            <option value="مباشر (بدون وكيل)">Direct (No Agent)</option>
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
            <option value="جميع المدن">All Cities</option>
            <option value="شرم الشيخ">Sharm El Sheikh</option>
            <option value="الغردقة">Hurghada</option>
            <option value="مرسى علم">Marsa Alam</option>
            <option value="دهب">Dahab &amp; El Sokhna</option>
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
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

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
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Total (€)</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Payment</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Status</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', transition: 'background var(--transition-fast)' }} className="table-row-hover">
                  <td style={{ padding: '1.2rem 1rem', fontFamily: 'var(--font-en)', fontWeight: 'bold' }}>{booking.id}</td>
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
                  </td>
                  <td style={{ padding: '1.2rem 1rem' }}>
                    <span className={`badge badge-${booking.status === 'مؤكد' || booking.status === 'Confirmed' ? 'emerald' : booking.status === 'مكتمل' || booking.status === 'Completed' ? 'ocean' : booking.status === 'ملغي' || booking.status === 'Cancelled' ? 'coral' : 'gold'}`}>
                      {booking.status === 'مؤكد' ? 'Confirmed' : booking.status === 'مكتمل' ? 'Completed' : booking.status === 'ملغي' ? 'Cancelled' : booking.status === 'قيد الانتظار' ? 'Pending' : booking.status}
                    </span>
                  </td>
                  <td style={{ padding: '1.2rem 1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                      <button
                        onClick={() => handlePrintAgreement(booking)}
                        title="Print Digital Agreement"
                        style={{
                          padding: '6px 12px',
                          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        📄 Print
                      </button>
                       <select 
                        value={STATUS_AR_TO_EN[booking.status] || booking.status} 
                        onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '4px',
                          border: '1px solid var(--border-medium)',
                          background: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          fontSize: '12px',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    ❌ No bookings match the current search or filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
