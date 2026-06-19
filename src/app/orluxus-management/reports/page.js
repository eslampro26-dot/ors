'use client';

import { useState } from 'react';

export default function AdminReports() {
  const [reportPeriod, setReportPeriod] = useState('الشهر الحالي');

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)', textAlign: 'right' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }} className="hide-print">
        <div>
          <h2 style={{ color: 'var(--text-primary)', fontWeight: '800' }}>التقارير والإحصائيات - ORLUXUS</h2>
          <p style={{ color: 'var(--text-secondary)' }}>التقارير المالية والأداء العام للمنصة والوكلاء.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select 
            value={reportPeriod}
            onChange={(e) => setReportPeriod(e.target.value)}
            style={{ 
              padding: '8px 12px', 
              background: 'var(--bg-tertiary)', 
              color: 'var(--text-primary)', 
              border: '1px solid var(--border-medium)', 
              borderRadius: '6px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="الشهر الحالي">الشهر الحالي</option>
            <option value="الشهر الماضي">الشهر الماضي</option>
            <option value="الربع الحالي">الربع الحالي</option>
            <option value="العام الحالي">العام الحالي</option>
          </select>
          <button onClick={handlePrintPDF} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>⬇️</span> تحميل التقرير (PDF)
          </button>
        </div>
      </div>

      {/* Printable Area Header */}
      <div className="show-print-only" style={{ display: 'none', borderBottom: '2px solid #000', paddingBottom: '1rem', marginBottom: '2rem', textAlign: 'left' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#b45309', margin: 0 }}>ORLUXUS</h1>
        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>لوحة الإدارة - تقرير الأداء المالي لـ ({reportPeriod})</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-xl)' }}>
        
        {/* KPI 1 */}
        <div className="glass-card animate-fade-in-up" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>الخدمات الأكثر مبيعاً</h3>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <li style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span>1. باكدج القاهرة والأقصر</span>
              <span style={{ color: 'var(--gold-400)', fontWeight: 'bold', fontFamily: 'var(--font-en)' }}>€45,000</span>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span>2. رحلة رأس محمد (شرم الشيخ)</span>
              <span style={{ color: 'var(--gold-400)', fontWeight: 'bold', fontFamily: 'var(--font-en)' }}>€12,500</span>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span>3. سفاري الجونة (الغردقة)</span>
              <span style={{ color: 'var(--gold-400)', fontWeight: 'bold', fontFamily: 'var(--font-en)' }}>€8,200</span>
            </li>
          </ul>
        </div>

        {/* KPI 2 */}
        <div className="glass-card animate-fade-in-up" style={{ animationDelay: '0.1s', padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>المدن الأكثر طلباً</h3>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <li style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span>1. شرم الشيخ</span>
              <span style={{ color: 'var(--emerald-400)', fontWeight: 'bold' }}>1,250 حجز</span>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span>2. الغردقة</span>
              <span style={{ color: 'var(--emerald-400)', fontWeight: 'bold' }}>980 حجز</span>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span>3. القاهرة (باكدجات)</span>
              <span style={{ color: 'var(--emerald-400)', fontWeight: 'bold' }}>450 حجز</span>
            </li>
          </ul>
        </div>
        
        {/* Commissions Card */}
        <div className="glass-card animate-fade-in-up" style={{ animationDelay: '0.2s', gridColumn: '1 / -1', padding: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>💰 ملخص العمولات للوكلاء</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            إجمالي العمولات المستحقة الدفع للوكلاء عن فترة (<strong style={{ color: 'var(--gold-400)' }}>{reportPeriod}</strong>): <strong style={{ color: 'var(--gold-400)', fontSize: '1.3rem', fontFamily: 'var(--font-en)' }}>€35,400</strong>
          </p>
          <div style={{ marginTop: '1.5rem' }} className="hide-print">
            <button className="btn btn-secondary" onClick={() => alert('تحميل ملف العمولات المفصل للوكلاء...')}>
              عرض تقرير العمولات المفصل
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
            font-size: 14px;
          }
          .hide-print {
            display: none !important;
          }
          .show-print-only {
            display: block !important;
          }
          .glass-card {
            background: #ffffff !important;
            border: 1px solid #e2e8f0 !important;
            box-shadow: none !important;
            color: #000000 !important;
            padding: 1.5rem !important;
          }
          h2, h3, span, strong {
            color: #000000 !important;
          }
        }
      `}</style>
    </div>
  );
}
