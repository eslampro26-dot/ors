'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { tierConfig } from '@/lib/data';

export default function AgentSales() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('كل المدن');
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSalesData = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/agent/dashboard', { credentials: 'include' });
        if (!res.ok) {
          setError('تعذر تحميل بيانات المبيعات.');
          return;
        }
        const data = await res.json();
        const { agent, bookings } = data;

        const commissionRate = tierConfig[agent?.tier || 'bronze'].commission;

        // Map to transaction structure
        const mapped = (bookings || []).map(b => ({
          id: b.id,
          date: b.date,
          customer: b.customer,
          service: b.service,
          city: b.city || 'شرم الشيخ',
          amount: `€${b.finalAmount.toLocaleString()}`,
          commission: `€${(b.finalAmount * (commissionRate / 100)).toFixed(2)}`,
          status: b.status,
          rawAmount: b.finalAmount
        }));

        // Sort by date descending
        mapped.sort((a, b) => new Date(b.date) - new Date(a.date));
        setAllTransactions(mapped);
      } catch (e) {
        console.error('Error loading sales data', e);
        setError('حدث خطأ أثناء تحميل البيانات.');
      } finally {
        setLoading(false);
      }
    };
    loadSalesData();
  }, []);

  const filtered = allTransactions.filter(trx => {
    const matchesSearch =
      trx.service.includes(searchTerm) ||
      trx.customer.includes(searchTerm) ||
      trx.id.includes(searchTerm);

    const matchesCity = cityFilter === 'كل المدن' || trx.city === cityFilter;

    return matchesSearch && matchesCity;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: 'var(--text-secondary)' }}>
        جاري تحميل سجل المبيعات...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: 'var(--coral-400)' }}>
        {error}
      </div>
    );
  }

  return (
    <div className={styles.salesPage}>
      <div className={`${styles.filterCard} glass-card animate-fade-in-up`}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>◎</span>
          <input 
            type="text" 
            placeholder="ابحث برقم الحجز، الخدمة، أو اسم العميل..." 
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.filters}>
          <select 
            className={styles.select} 
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
          >
            <option value="كل المدن">كل المدن</option>
            <option value="شرم الشيخ">شرم الشيخ</option>
            <option value="الغردقة">الغردقة</option>
            <option value="مرسى علم">مرسى علم</option>
            <option value="دهب">دهب والعين السخنة</option>
          </select>
        </div>
      </div>

      <div className={`${styles.tableCard} glass-card animate-fade-in-up`} style={{ animationDelay: '0.1s' }}>
        <div className={styles.tableHeader}>
          <h3>سجل المبيعات والعمليات الحقيقية</h3>
          <span className="badge badge-ocean">إجمالي: {filtered.length} عملية</span>
        </div>
        
        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>رقم الحجز</th>
                <th>التاريخ</th>
                <th>العميل</th>
                <th>الخدمة والوجهة</th>
                <th>المدينة</th>
                <th>القيمة المدفوعة</th>
                <th>عمولتي</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((trx, idx) => (
                <tr key={idx}>
                  <td><span className={styles.mono}>{trx.id}</span></td>
                  <td>{trx.date}</td>
                  <td><strong>{trx.customer}</strong></td>
                  <td>{trx.service}</td>
                  <td>
                    <span style={{ fontSize: '11px', color: 'var(--gold-500)', background: 'rgba(251,191,36,0.08)', padding: '2px 6px', borderRadius: '4px' }}>
                      ◆ {trx.city}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-en)' }}>{trx.amount}</td>
                  <td className={styles.textEmerald} style={{ fontFamily: 'var(--font-en)', fontWeight: 'bold' }}><strong>{trx.commission}</strong></td>
                  <td>
                    <span className={`badge badge-${trx.status === 'مؤكد' ? 'emerald' : trx.status === 'مكتمل' ? 'ocean' : trx.status === 'ملغي' ? 'coral' : 'gold'}`}>
                      {trx.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    لا توجد عمليات مطابقة لخيارات البحث المحددة.
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
