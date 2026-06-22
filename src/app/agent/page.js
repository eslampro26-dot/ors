'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { tierConfig } from '@/lib/data';

export default function AgentDashboard() {
  const [currentAgent, setCurrentAgent] = useState(null);
  const [kpis, setKpis] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [salesProgress, setSalesProgress] = useState(0);
  const [trxProgress, setTrxProgress] = useState(0);
  const [monthlyChart, setMonthlyChart] = useState([]);
  const [bookingStats, setBookingStats] = useState({ new: 0, confirmed: 0, cancelled: 0, total: 0 });
  const [availableBalance, setAvailableBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [referralCopied, setReferralCopied] = useState(false);

  // Quick sub-agent form states
  const [subName, setSubName] = useState('');
  const [subEmail, setSubEmail] = useState('');
  const [subUsername, setSubUsername] = useState('');
  const [subPassword, setSubPassword] = useState('');
  const [subPromo, setSubPromo] = useState('');
  const [addingAgent, setAddingAgent] = useState(false);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/agent/dashboard', { credentials: 'include' });
      if (!res.ok) {
        setError('تعذر تحميل بيانات لوحة التحكم.');
        return;
      }
      const data = await res.json();
      const { agent, bookings, activeSubAgentsCount } = data;

      setCurrentAgent(agent);

      const allBookings = bookings || [];
      const activeBookings = allBookings.filter(b => b.status !== 'ملغي');
      const newBookings    = allBookings.filter(b => b.status === 'قيد الانتظار' || b.status === 'جديد');
      const confirmedBookings = allBookings.filter(b => b.status === 'مؤكد' || b.status === 'مكتمل');
      const cancelledBookings = allBookings.filter(b => b.status === 'ملغي');

      setBookingStats({
        new: newBookings.length,
        confirmed: confirmedBookings.length,
        cancelled: cancelledBookings.length,
        total: allBookings.length,
      });

      const totalSales = activeBookings.reduce((sum, b) => sum + b.finalAmount, 0);
      const transactionCount = activeBookings.length;

      const commissionRate = tierConfig[agent?.tier || 'bronze'].commission;
      const totalCommission = totalSales * (commissionRate / 100);
      // Available balance = commission earned (simplified — can be adjusted for withdrawals)
      setAvailableBalance(totalCommission);

      // Progress toward Silver
      const targetSales = 96000;
      const targetTrx = 1920;
      setSalesProgress(Math.min(100, Math.round((totalSales / targetSales) * 100)));
      setTrxProgress(Math.min(100, Math.round((transactionCount / targetTrx) * 100)));

      // KPI cards
      setKpis([
        { label: 'الرصيد المتاح للسحب', value: `€${totalCommission.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, target: `عمولة ${commissionRate}%`, icon: '◆', colorClass: styles.kpiCardGold, trend: 'متاح' },
        { label: 'إجمالي المبيعات النشطة', value: `€${totalSales.toLocaleString()}`, target: 'الهدف: €96,000', icon: '▲', colorClass: styles.kpiCardOcean, trend: `${salesProgress}%` },
        { label: 'إجمالي الحجوزات', value: allBookings.length.toString(), target: `${newBookings.length} جديد · ${confirmedBookings.length} مؤكد`, icon: '▣', colorClass: styles.kpiCardEmerald, trend: `${cancelledBookings.length} ملغي` },
        { label: 'شركاء نشطين تحتي', value: activeSubAgentsCount.toString(), target: 'شجرة تسويقية', icon: '◉', colorClass: styles.kpiCardCoral, trend: `+${activeSubAgentsCount}` },
      ]);

      // Recent transactions (latest 5)
      const recent = [...allBookings]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
        .map(b => ({
          id: b.id,
          date: b.date,
          service: b.service,
          customer: b.customer || '—',
          amount: `€${b.finalAmount}`,
          commission: `€${(b.finalAmount * (commissionRate / 100)).toFixed(2)}`,
          status: b.status,
        }));
      setRecentTransactions(recent);

      // Monthly chart
      const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
      const monthlyTotals = Array(12).fill(0);
      activeBookings.forEach(b => {
        if (b.date) {
          const m = new Date(b.date).getMonth();
          if (m >= 0 && m < 12) monthlyTotals[m] += b.finalAmount;
        }
      });
      const maxVal = Math.max(...monthlyTotals, 200);
      setMonthlyChart([0,1,2,3,4].map(idx => ({
        name: months[idx],
        height: `${Math.max(10, (monthlyTotals[idx] / maxVal) * 100)}%`,
        value: `€${monthlyTotals[idx]}`,
      })));

    } catch (e) {
      console.error('Error loading dashboard stats', e);
      setError('حدث خطأ أثناء تحميل البيانات.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboardData(); }, []);

  const handleAddSubAgent = async (e) => {
    e.preventDefault();
    if (!subName || !subEmail || !subUsername || !subPassword) {
      alert('الرجاء ملء جميع الحقول المطلوبة!');
      return;
    }
    setAddingAgent(true);
    try {
      const res = await fetch('/api/agent/sub-agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: subName, email: subEmail, username: subUsername, password: subPassword, promoCode: subPromo }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || 'فشل إضافة الوكيل الفرعي!'); return; }
      alert(`تمت إضافة الوكيل الفرعي ${subName} بنجاح!`);
      setSubName(''); setSubEmail(''); setSubUsername(''); setSubPassword(''); setSubPromo('');
      await loadDashboardData();
    } catch (err) {
      console.error('Error adding subagent:', err);
      alert('فشل إضافة الوكيل الفرعي!');
    } finally {
      setAddingAgent(false);
    }
  };

  const handleCopyReferral = () => {
    const promoCode = currentAgent?.promoCodes?.[0] || '';
    const referralLink = `${typeof window !== 'undefined' ? window.location.origin : 'https://orluxus.com'}?promo=${promoCode}`;
    navigator.clipboard.writeText(referralLink).then(() => {
      setReferralCopied(true);
      setTimeout(() => setReferralCopied(false), 2500);
    });
  };

  if (loading) {
    return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'300px', color:'var(--text-secondary)' }}>جاري تحميل لوحة التحكم...</div>;
  }
  if (error) {
    return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'300px', color:'var(--coral-400)' }}>{error}</div>;
  }

  const agentName = currentAgent?.name?.split(' ')[0] || 'الوكيل';
  const promoCode = currentAgent?.promoCodes?.[0] || 'بدون كود';
  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : 'https://orluxus.com'}?promo=${promoCode}`;
  const commissionRate = tierConfig[currentAgent?.tier || 'bronze'].commission;

  return (
    <div className={styles.dashboard}>

      {/* ── Welcome Banner ── */}
      <div className={`${styles.sectionCard} glass-card animate-fade-in-up`} style={{ background: 'var(--gradient-card)', border: '1px solid var(--border-accent)', boxShadow: 'var(--shadow-glow-gold)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1.5rem' }}>
          <div>
            <h2 style={{ fontSize:'1.6rem', color:'var(--text-primary)', fontWeight:'800', margin:0 }}>مرحباً {agentName}!</h2>
            <p style={{ color:'var(--text-secondary)', marginTop:'6px', fontSize:'0.95rem' }}>
              كود الخصم الخاص بك:{' '}
              <strong style={{ color:'var(--gold-400)', background:'rgba(251,191,36,0.1)', padding:'2px 10px', borderRadius:'4px', border:'1px dashed var(--gold-500)', fontSize:'1.1rem', fontFamily:'var(--font-en)' }}>
                {promoCode}
              </strong>
            </p>
          </div>
          <div style={{ background:'var(--bg-glass-strong)', padding:'10px 20px', borderRadius:'12px', border:'1px solid var(--border-subtle)', textAlign:'center' }}>
            <span style={{ fontSize:'12px', color:'var(--text-tertiary)', display:'block' }}>مستواك الحالي:</span>
            <strong style={{ color: tierConfig[currentAgent?.tier]?.color || 'var(--gold-400)', fontSize:'1.2rem', display:'flex', alignItems:'center', gap:'6px', marginTop:'4px' }}>
              {tierConfig[currentAgent?.tier]?.icon || '◆'} {tierConfig[currentAgent?.tier]?.nameAr || 'برونزي'}
            </strong>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className={styles.kpiGrid}>
        {kpis.map((kpi, idx) => (
          <div key={idx} className={`${styles.kpiCard} ${kpi.colorClass}`}>
            <div className={styles.kpiHeader}>
              <div className={styles.kpiIcon} style={{ fontSize:'20px', color:'var(--gold-400)' }}>{kpi.icon}</div>
              <span className={`${styles.kpiTrend} ${styles.kpiTrendUp}`}>{kpi.trend}</span>
            </div>
            <div className={styles.kpiValue}>{kpi.value}</div>
            <div className={styles.kpiLabel}>{kpi.label}</div>
            {kpi.target && <div style={{ fontSize:'10px', color:'var(--text-tertiary)', marginTop:'6px' }}>{kpi.target}</div>}
          </div>
        ))}
      </div>

      {/* ── Booking Status Breakdown ── */}
      <div className={styles.sectionCard} style={{ padding: '1.5rem 2rem' }}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>▣ تفصيل الحجوزات الكاملة</h3>
          <span className={styles.sectionAction} onClick={loadDashboardData} style={{ cursor:'pointer' }}>تحديث</span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem' }}>
          {[
            { label:'إجمالي الحجوزات', count: bookingStats.total, color:'var(--text-primary)', bg:'var(--bg-glass)' },
            { label:'جديدة / قيد الانتظار', count: bookingStats.new, color:'var(--gold-400)', bg:'rgba(251,191,36,0.07)' },
            { label:'مؤكدة / مكتملة', count: bookingStats.confirmed, color:'var(--emerald-400)', bg:'rgba(16,185,129,0.07)' },
            { label:'ملغاة', count: bookingStats.cancelled, color:'var(--coral-400)', bg:'rgba(244,63,94,0.07)' },
          ].map((stat, i) => (
            <div key={i} style={{ background: stat.bg, border:`1px solid ${stat.color}30`, borderRadius:'12px', padding:'1.2rem', textAlign:'center' }}>
              <div style={{ fontSize:'2rem', fontWeight:'800', color: stat.color, fontFamily:'var(--font-en)' }}>{stat.count}</div>
              <div style={{ fontSize:'12px', color:'var(--text-secondary)', marginTop:'4px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Referral Link + Available Balance ── */}
      <div className={styles.dualGrid}>
        {/* Referral Link Card */}
        <div className={styles.sectionCard} style={{ border:'1px solid var(--gold-500)30', background:'rgba(201,162,39,0.04)' }}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>◐ رابط الإحالة الخاص بك</h3>
          </div>
          <p style={{ color:'var(--text-secondary)', fontSize:'13px', lineHeight:'1.6', marginBottom:'1.2rem' }}>
            شارك هذا الرابط مع عملائك. أي حجز يتم عبره سيُسجَّل تلقائياً تحت حسابك ويضيف عمولة مباشرة إلى رصيدك.
          </p>
          <div style={{ background:'var(--bg-glass-strong)', border:'1px dashed var(--border-accent)', borderRadius:'10px', padding:'0.9rem 1.2rem', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem', flexWrap:'wrap' }}>
            <span style={{ fontFamily:'var(--font-en)', fontSize:'13px', color:'var(--text-secondary)', wordBreak:'break-all', direction:'ltr' }}>
              {referralLink}
            </span>
            <button
              onClick={handleCopyReferral}
              className="btn btn-primary"
              style={{ padding:'6px 18px', fontSize:'12px', flexShrink:0 }}
            >
              {referralCopied ? '✓ تم النسخ' : 'نسخ الرابط'}
            </button>
          </div>
          <div style={{ marginTop:'1.2rem', display:'flex', gap:'0.8rem', flexWrap:'wrap' }}>
            <div style={{ flex:1, background:'var(--bg-glass)', borderRadius:'8px', padding:'0.8rem', textAlign:'center', border:'1px solid var(--border-subtle)' }}>
              <div style={{ fontSize:'11px', color:'var(--text-tertiary)' }}>كود الخصم</div>
              <div style={{ fontSize:'1.1rem', fontWeight:'800', color:'var(--gold-400)', fontFamily:'var(--font-en)', marginTop:'4px' }}>{promoCode}</div>
            </div>
            <div style={{ flex:1, background:'var(--bg-glass)', borderRadius:'8px', padding:'0.8rem', textAlign:'center', border:'1px solid var(--border-subtle)' }}>
              <div style={{ fontSize:'11px', color:'var(--text-tertiary)' }}>نسبة العمولة</div>
              <div style={{ fontSize:'1.1rem', fontWeight:'800', color:'var(--emerald-400)', fontFamily:'var(--font-en)', marginTop:'4px' }}>{commissionRate}%</div>
            </div>
            <div style={{ flex:1, background:'var(--bg-glass)', borderRadius:'8px', padding:'0.8rem', textAlign:'center', border:'1px solid var(--gold-500)40' }}>
              <div style={{ fontSize:'11px', color:'var(--text-tertiary)' }}>الرصيد المتاح</div>
              <div style={{ fontSize:'1.1rem', fontWeight:'800', color:'var(--gold-400)', fontFamily:'var(--font-en)', marginTop:'4px' }}>€{availableBalance.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Sub-agent Registration */}
        <div className={styles.sectionCard} style={{ background:'var(--bg-glass-strong)', border:'1px solid var(--border-accent)' }}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>◉ تسجيل وكلاء فرعيين</h3>
          </div>
          <p style={{ color:'var(--text-secondary)', fontSize:'12px', marginBottom:'1.2rem', lineHeight:'1.5' }}>
            أضف أشخاصاً يعملون تحت حسابك وسجل لهم أكواد خصم خاصة. ستحصل على عمولة إضافية تلقائياً!
          </p>
          <form onSubmit={handleAddSubAgent} style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
            <input type="text" placeholder="الاسم الكامل للوكيل الجديد *" value={subName} onChange={e => setSubName(e.target.value)} required
              style={{ padding:'8px 12px', borderRadius:'6px', border:'1px solid var(--border-medium)', background:'var(--bg-primary)', color:'var(--text-primary)', outline:'none', fontSize:'13px' }} />
            <input type="email" placeholder="البريد الإلكتروني *" value={subEmail} onChange={e => setSubEmail(e.target.value)} required
              style={{ padding:'8px 12px', borderRadius:'6px', border:'1px solid var(--border-medium)', background:'var(--bg-primary)', color:'var(--text-primary)', outline:'none', fontSize:'13px', textAlign:'left' }} />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem' }}>
              <input type="text" placeholder="اسم المستخدم *" value={subUsername} onChange={e => setSubUsername(e.target.value)} required
                style={{ padding:'8px 12px', borderRadius:'6px', border:'1px solid var(--border-medium)', background:'var(--bg-primary)', color:'var(--text-primary)', outline:'none', fontSize:'13px', textAlign:'left' }} />
              <input type="password" placeholder="كلمة المرور *" value={subPassword} onChange={e => setSubPassword(e.target.value)} required
                style={{ padding:'8px 12px', borderRadius:'6px', border:'1px solid var(--border-medium)', background:'var(--bg-primary)', color:'var(--text-primary)', outline:'none', fontSize:'13px' }} />
            </div>
            <input type="text" placeholder="كود الخصم المخصص (مثال: YOUSSEF10)" value={subPromo} onChange={e => setSubPromo(e.target.value)}
              style={{ padding:'8px 12px', borderRadius:'6px', border:'1px solid var(--border-medium)', background:'var(--bg-primary)', color:'var(--text-primary)', outline:'none', fontSize:'13px', textAlign:'center', fontWeight:'bold', textTransform:'uppercase' }} />
            <button type="submit" className="btn btn-primary" style={{ padding:'8px', fontSize:'13px', fontWeight:'bold', marginTop:'0.5rem' }} disabled={addingAgent}>
              {addingAgent ? 'جاري الإضافة...' : '+ تسجيل وتفعيل'}
            </button>
          </form>
        </div>
      </div>

      {/* ── Chart + Tier Progress ── */}
      <div className={styles.dualGrid}>
        {/* Monthly Chart */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>▲ الأداء المالي الشهري</h3>
            <span className={styles.sectionAction} onClick={loadDashboardData} style={{ cursor:'pointer' }}>تحديث</span>
          </div>
          <div className={styles.chart}>
            {monthlyChart.map((bar, idx) => (
              <div key={idx} className={styles.chartBar}>
                <span className={styles.barValue}>{bar.value}</span>
                <div className={styles.bar} style={{ height: bar.height }}></div>
                <span className={styles.barLabel}>{bar.name}</span>
              </div>
            ))}
          </div>
          <div className={styles.chartSummary}>
            <div className={styles.chartStat}>
              <span className={styles.chartStatValue}>€{(currentAgent?.sales || 0).toLocaleString()}</span>
              <span className={styles.chartStatLabel}>إجمالي مبيعات شبكتك</span>
            </div>
            <div className={styles.chartStat}>
              <span className={styles.chartStatValue}>
                €{availableBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
              <span className={styles.chartStatLabel}>الأرباح المستحقة</span>
            </div>
          </div>
        </div>

        {/* Tier Progress */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>◆ ترقية مستوى التوكيل</h3>
          </div>
          <div className={styles.tierProgress}>
            <div className={styles.tierCurrentInfo}>
              <span className={styles.tierEmoji} style={{ fontSize:'28px', color:'var(--gold-400)' }}>◈</span>
              <div>
                <div className={styles.tierName}>هدف المستوى الفضي (SILVER)</div>
                <div className={styles.tierCommission}>عمولة مرتفعة: 15% على المبيعات</div>
              </div>
            </div>
            <div className={styles.progressItem}>
              <div className={styles.progressLabel}>
                <span className={styles.progressText}>الهدف المالي السنوي</span>
                <span className={styles.progressNumbers}>€{(currentAgent?.sales || 0).toLocaleString()} / €96,000</span>
              </div>
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width:`${salesProgress}%` }}></div>
              </div>
            </div>
            <div className={styles.progressItem}>
              <div className={styles.progressLabel}>
                <span className={styles.progressText}>عدد الحجوزات</span>
                <span className={styles.progressNumbers}>{bookingStats.confirmed} / 1,920</span>
              </div>
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width:`${trxProgress}%` }}></div>
              </div>
            </div>
            <div className={styles.nextTierHint}>
              <span className={styles.nextTierText}>
                الترقية تضمن لك زيادة فورية في العمولات والتحكم المطلق بـ{' '}
                <span className={styles.nextTierName}>أكواد خصم إضافية</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Transactions ── */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>▣ أحدث العمليات والحجوزات الحية</h3>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>رقم الحجز</th>
                <th>التاريخ</th>
                <th>العميل</th>
                <th>الخدمة</th>
                <th>القيمة</th>
                <th>عمولتي</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((trx, idx) => (
                <tr key={idx}>
                  <td style={{ fontFamily:'var(--font-en)', fontWeight:'bold' }}>{trx.id}</td>
                  <td>{trx.date}</td>
                  <td>{trx.customer}</td>
                  <td>{trx.service}</td>
                  <td className={styles.amountCell}>{trx.amount}</td>
                  <td className={styles.amountCell} style={{ color:'var(--emerald-400)' }}>{trx.commission}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${trx.status === 'مكتمل' || trx.status === 'مؤكد' ? styles.statusComplete : trx.status === 'ملغي' ? styles.statusCancelled : styles.statusPending}`}>
                      {trx.status}
                    </span>
                  </td>
                </tr>
              ))}
              {recentTransactions.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ padding:'3rem', textAlign:'center', color:'var(--text-tertiary)' }}>
                    لا توجد عمليات مسجلة. شارك أكواد الخصم لتبدأ كسب الأرباح!
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
