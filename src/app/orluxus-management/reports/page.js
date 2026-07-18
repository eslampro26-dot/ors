'use client';

import { useState, useEffect } from 'react';
import { getBookings, getAgents } from '@/lib/db';
import { tierConfig } from '@/lib/data';

export default function AdminReports() {
  const [reportPeriod, setReportPeriod] = useState('الشهر الحالي');
  const [bookings, setBookings] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load bookings and agents data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [bookingsData, agentsData] = await Promise.all([
          getBookings(),
          getAgents()
        ]);
        setBookings(bookingsData || []);
        setAgents(agentsData || []);
      } catch (e) {
        console.error('Error loading reports data:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handlePrintPDF = () => {
    window.print();
  };

  // Helper to filter bookings by selected reportPeriod
  const getFilteredBookings = () => {
    const now = new Date();
    return bookings.filter(b => {
      // Exclude cancelled bookings from statistics
      const status = (b.status || '').toLowerCase();
      if (status === 'ملغي' || status === 'cancelled') return false;

      const dateStr = b.createdAt || b.date || 0;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return false;

      switch (reportPeriod) {
        case 'الشهر الحالي':
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        case 'الشهر الماضي': {
          const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
          const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
          return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
        }
        case 'الربع الحالي': {
          const currentQuarter = Math.floor(now.getMonth() / 3);
          const bookingQuarter = Math.floor(d.getMonth() / 3);
          return bookingQuarter === currentQuarter && d.getFullYear() === now.getFullYear();
        }
        case 'العام الحالي':
          return d.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });
  };

  const periodBookings = getFilteredBookings();

  // 1. Compute Best Selling Services (grouped by service name)
  const serviceStats = {};
  periodBookings.forEach(b => {
    const serviceName = b.service || 'غير محدد';
    const amount = parseFloat(b.finalAmount) || parseFloat(b.totalPrice) || parseFloat(b.price) || 0;
    if (!serviceStats[serviceName]) serviceStats[serviceName] = 0;
    serviceStats[serviceName] += amount;
  });

  const topServices = Object.entries(serviceStats)
    .map(([name, sales]) => ({ name, sales }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 3);

  // 2. Compute Most Requested Cities (grouped by city)
  const cityStats = {};
  periodBookings.forEach(b => {
    const city = b.city || 'أخرى';
    if (!cityStats[city]) cityStats[city] = 0;
    cityStats[city] += 1;
  });

  const topCities = Object.entries(cityStats)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // 3. Compute Commissions for Agents
  let totalCommissions = 0;
  periodBookings.forEach(b => {
    if (b.agentId) {
      // Find agent tier to get commission percentage
      const agent = agents.find(a => String(a.id) === String(b.agentId));
      const tier = agent?.tier || 'bronze';
      const commRate = tierConfig[tier]?.commission || 10;
      const amount = parseFloat(b.finalAmount) || parseFloat(b.totalPrice) || parseFloat(b.price) || 0;
      totalCommissions += amount * (commRate / 100);
    }
  });

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

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          جاري تحميل وتوليد التقارير المالية...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-xl)' }}>
          
          {/* KPI 1 - Best Selling Services */}
          <div className="glass-card animate-fade-in-up" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>الخدمات الأكثر مبيعاً</h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {topServices.length > 0 ? (
                topServices.map((svc, idx) => (
                  <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span>{idx + 1}. {svc.name}</span>
                    <span style={{ color: 'var(--gold-400)', fontWeight: 'bold', fontFamily: 'var(--font-en)' }}>€{svc.sales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </li>
                ))
              ) : (
                <li style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '1rem' }}>لا توجد مبيعات في هذه الفترة</li>
              )}
            </ul>
          </div>

          {/* KPI 2 - Most Requested Cities */}
          <div className="glass-card animate-fade-in-up" style={{ animationDelay: '0.1s', padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>المدن الأكثر طلباً</h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {topCities.length > 0 ? (
                topCities.map((city, idx) => (
                  <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span>{idx + 1}. {city.name}</span>
                    <span style={{ color: 'var(--emerald-400)', fontWeight: 'bold' }}>{city.count} حجز</span>
                  </li>
                ))
              ) : (
                <li style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '1rem' }}>لا توجد حجوزات في هذه الفترة</li>
              )}
            </ul>
          </div>
          
          {/* Commissions Card */}
          <div className="glass-card animate-fade-in-up" style={{ animationDelay: '0.2s', gridColumn: '1 / -1', padding: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>💰 ملخص العمولات للوكلاء</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
              إجمالي العمولات المستحقة الدفع للوكلاء عن فترة (<strong style={{ color: 'var(--gold-400)' }}>{reportPeriod}</strong>): <strong style={{ color: 'var(--gold-400)', fontSize: '1.3rem', fontFamily: 'var(--font-en)' }}>€{totalCommissions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </p>
            <div style={{ marginTop: '1.5rem' }} className="hide-print">
              <button className="btn btn-secondary" onClick={() => alert(`تقرير عمولات مفصل لعدد ${periodBookings.filter(b => b.agentId).length} حجز بواسطة الوكلاء خلال هذه الفترة.`)}>
                عرض تقرير العمولات المفصل
              </button>
            </div>
          </div>
        </div>
      )}

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
