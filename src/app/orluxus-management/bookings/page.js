'use client';

import { useState, useEffect } from 'react';
import { getBookings, updateBookingStatus, getAgents } from '@/lib/db';

export default function AdminBookings() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('جميع المدن');
  const [statusFilter, setStatusFilter] = useState('جميع الحالات');
  const [agentFilter, setAgentFilter] = useState('جميع الوكلاء');
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

  // Export Bookings to CSV (Excel compatible with UTF-8 BOM for Arabic support)
  const handleExportCSV = () => {
    const headers = ['رقم الحجز', 'التاريخ', 'اسم العميل', 'رقم الهاتف', 'الخدمة المطلوبة', 'المدينة', 'الوكيل المسؤول', 'كود الخصم', 'المبلغ الأصلي', 'قيمة الخصم', 'المبلغ النهائي', 'طريقة الدفع', 'حالة الحجز'];
    const rows = filteredBookings.map(b => [
      b.id,
      b.date,
      b.customer,
      `"${b.phone}"`, // Wrap phone in quotes to prevent Excel from formatting it as scientific number
      b.service,
      b.city,
      b.agentName || 'مباشر (بدون وكيل)',
      b.promoCode || 'بدون كود',
      `€${b.originalAmount || b.finalAmount}`,
      `€${b.discountAmount || 0}`,
      `€${b.finalAmount}`,
      b.paymentType === 'cash' || b.paymentType === 'onsite' ? 'كاش' : (b.paymentType === 'card' ? 'بطاقة ائتمان' : 'PayPal'),
      b.status
    ]);

    // UTF-8 BOM indicator for proper Excel Arabic decoding
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

  // Change Booking Status
  const handleStatusChange = async (id, newStatus) => {
    try {
      const success = await updateBookingStatus(id, newStatus);
      if (success) {
        alert(`تم تحديث حالة الحجز ${id} بنجاح!`);
        await loadData();
      } else {
        alert('فشل تحديث حالة الحجز!');
      }
    } catch (err) {
      console.error('Error updating booking status:', err);
      alert('حدث خطأ أثناء تحديث حالة الحجز!');
    }
  };

  // Print Digital Agreement
  const handlePrintAgreement = (booking) => {
    const printWindow = window.open('', '_blank');
    const agreementHTML = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>اتفاقية الحجز - ORLUXUS</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #c9a227; padding-bottom: 20px; }
          .logo { font-size: 2.5rem; font-weight: 900; color: #c9a227; letter-spacing: 4px; }
          .title { font-size: 1.8rem; font-weight: bold; margin-top: 10px; }
          .section { margin-bottom: 25px; }
          .section-title { font-weight: bold; color: #0f172a; font-size: 1.1rem; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
          .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
          .info-item { display: flex; justify-content: space-between; }
          .label { color: #64748b; }
          .value { font-weight: bold; color: #0f172a; }
          .terms { background: #f8fafc; padding: 20px; border-radius: 8px; margin-top: 20px; }
          .signature-section { margin-top: 40px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 50px; }
          .signature-box { border: 1px solid #e2e8f0; padding: 20px; text-align: center; height: 150px; }
          .footer { margin-top: 30px; text-align: center; color: #64748b; font-size: 0.9rem; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">ORLUXUS</div>
          <div class="title">اتفاقية الحجز الرقمية</div>
          <div style="color: #64748b; margin-top: 5px;">رقم الحجز: ${booking.id}</div>
        </div>

        <div class="section">
          <div class="section-title">معلومات العميل</div>
          <div class="info-grid">
            <div class="info-item"><span class="label">الاسم:</span><span class="value">${booking.customer}</span></div>
            <div class="info-item"><span class="label">رقم الهاتف:</span><span class="value">${booking.phone}</span></div>
            <div class="info-item"><span class="label">البريد الإلكتروني:</span><span class="value">${booking.email || '-'}</span></div>
            <div class="info-item"><span class="label">الواتساب:</span><span class="value">${booking.whatsapp || booking.phone}</span></div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">تفاصيل الحجز</div>
          <div class="info-grid">
            <div class="info-item"><span class="label">الخدمة:</span><span class="value">${booking.service}</span></div>
            <div class="info-item"><span class="label">المدينة:</span><span class="value">${booking.city}</span></div>
            <div class="info-item"><span class="label">التاريخ:</span><span class="value">${booking.date}</span></div>
            <div class="info-item"><span class="label">عدد المسافرين:</span><span class="value">${booking.travelers}</span></div>
            <div class="info-item"><span class="label">المبلغ الأصلي:</span><span class="value">€${booking.originalAmount || booking.finalAmount}</span></div>
            <div class="info-item"><span class="label">الخصم:</span><span class="value">€${booking.discountAmount || 0}</span></div>
            <div class="info-item"><span class="label">المبلغ النهائي:</span><span class="value">€${booking.finalAmount}</span></div>
            <div class="info-item"><span class="label">طريقة الدفع:</span><span class="value">${booking.paymentType}</span></div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">الشروط والأحكام</div>
          <div class="terms">
            <ol style="margin: 0; padding-right: 20px;">
              <li>الحجز ملزم وغير قابل للإلغاء إلا قبل 48 ساعة من موعد الرحلة.</li>
              <li>الدفع نقداً عند انطلاق الرحلة أو عبر التحويل البنكي.</li>
              <li>الشركة غير مسؤولة عن التأخير الناتج عن ظروف قاهرة.</li>
              <li>يجب احترام مواعيد الانطلاق المحددة.</li>
              <li>يحق للشركة تعديل البرنامج في حالات الطوارئ.</li>
            </ol>
          </div>
        </div>

        <div class="signature-section">
          <div class="signature-box">
            <div style="margin-bottom: 10px; font-weight: bold;">توقيع العميل</div>
            <div style="border-top: 1px solid #e2e8f0; margin-top: 60px; padding-top: 10px;">التاريخ: ____________</div>
          </div>
          <div class="signature-box">
            <div style="margin-bottom: 10px; font-weight: bold;">توقيع ORLUXUS</div>
            <div style="border-top: 1px solid #e2e8f0; margin-top: 60px; padding-top: 10px;">التاريخ: ____________</div>
          </div>
        </div>

        <div class="footer">
          <p>هذه الاتفاقية صالحة قانونياً وتعتبر إقراراً بالشروط والأحكام المذكورة أعلاه.</p>
          <p style="margin-top: 10px;">ORLUXUS - Luxury Services & Experiences | info@orluxus.com</p>
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
    const matchesSearch = b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.customer.includes(searchTerm) ||
                          b.phone.includes(searchTerm) ||
                          b.service.includes(searchTerm) ||
                          (b.txId && b.txId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCity = cityFilter === 'جميع المدن' || b.city === cityFilter;

    const matchesStatus = statusFilter === 'جميع الحالات' || b.status === statusFilter;

    let matchesAgent = true;
    if (agentFilter !== 'جميع الوكلاء') {
      if (agentFilter === 'مباشر (بدون وكيل)') {
        matchesAgent = !b.agentId;
      } else {
        matchesAgent = b.agentId?.toString() === agentFilter.toString();
      }
    }

    return matchesSearch && matchesCity && matchesStatus && matchesAgent;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)', textAlign: 'right' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ color: 'var(--text-primary)', fontWeight: '800' }}>إدارة الحجوزات والمبيعات - ORLUXUS</h2>
          <p style={{ color: 'var(--text-secondary)' }}>تتبع حجوزات المنصة، مراقبة الخصومات وأكواد إحالة الوكلاء وتصدير التقارير.</p>
        </div>
        <button 
          onClick={handleExportCSV} 
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem' }}
        >
          <span>⬇️</span> تصدير الحجوزات المصفاة (CSV/Excel)
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
          <input 
            type="text" 
            placeholder="البحث برقم الفاتورة/الحجز، العميل، رقم الهاتف أو الخدمة..." 
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
            <option value="جميع الوكلاء">جميع الوكلاء</option>
            <option value="مباشر (بدون وكيل)">مباشر (بدون وكيل)</option>
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
            <option value="جميع المدن">جميع المدن</option>
            <option value="شرم الشيخ">شرم الشيخ</option>
            <option value="الغردقة">الغردقة</option>
            <option value="مرسى علم">مرسى علم</option>
            <option value="دهب">دهب والعين السخنة</option>
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
            <option value="جميع الحالات">جميع الحالات</option>
            <option value="مؤكد">مؤكد</option>
            <option value="قيد الانتظار">قيد الانتظار</option>
            <option value="مكتمل">مكتمل</option>
            <option value="ملغي">ملغي</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="glass-card animate-fade-in-up" style={{ padding: '2rem 1.5rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-subtle)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>رقم الحجز</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>التاريخ</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>العميل / الجوال</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>الخدمة والوجهة</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>الوكيل</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>كود الخصم</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>الحساب المالي (€)</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>الدفع</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>الحالة</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold', textAlign: 'center' }}>إجراءات</th>
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
                      <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic', fontSize: '11px' }}>بدون وكيل (مباشر)</span>
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
                          (وفر €{booking.discountAmount})
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
                      {booking.paymentType === 'cash' || booking.paymentType === 'onsite' ? '💵 كاش' : (booking.paymentType === 'card' ? '💳 بطاقة' : '🅿️ PayPal')}
                    </span>
                  </td>
                  <td style={{ padding: '1.2rem 1rem' }}>
                    <span className={`badge badge-${booking.status === 'مؤكد' ? 'emerald' : booking.status === 'مكتمل' ? 'ocean' : booking.status === 'ملغي' ? 'coral' : 'gold'}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td style={{ padding: '1.2rem 1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                      <button
                        onClick={() => handlePrintAgreement(booking)}
                        title="طباعة الاتفاقية الرقمية"
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
                        📄 طباعة
                      </button>
                      <select 
                        value={booking.status} 
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
                        <option value="مؤكد">مؤكد</option>
                        <option value="قيد الانتظار">قيد الانتظار</option>
                        <option value="مكتمل">مكتمل</option>
                        <option value="ملغي">ملغي</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    ❌ لا توجد حجوزات تطابق البحث أو التصفية الحالية.
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
