'use client';

import styles from './page.module.css';

export default function AdminDashboard() {
  const kpis = [
    { label: 'إجمالي الإيرادات', value: '€2.4M', trend: '+15%', icon: '💰', color: 'gold' },
    { label: 'إجمالي الحجوزات', value: '45,200', trend: '+8%', icon: '📋', color: 'ocean' },
    { label: 'وكلاء نشطين', value: '342', trend: '+12%', icon: '👥', color: 'emerald' },
    { label: 'رحلات متاحة', value: '185', trend: '+2%', icon: '🚤', color: 'coral' },
    { label: 'إيرادات الشهر الحالي', value: '€185K', trend: '+5%', icon: '📈', color: 'gold' },
    { label: 'نسبة النمو السنوي', value: '24%', trend: '+4%', icon: '🚀', color: 'emerald' },
  ];

  const topAgents = [
    { id: 1, name: 'أحمد محمود', tier: 'silver', sales: '€105,000', bookings: 1250 },
    { id: 2, name: 'سارة إبراهيم', tier: 'gold', sales: '€98,500', bookings: 1100 },
    { id: 3, name: 'خالد عبد الرحمن', tier: 'silver', sales: '€85,200', bookings: 980 },
    { id: 4, name: 'منى جمال', tier: 'bronze', sales: '€75,000', bookings: 850 },
    { id: 5, name: 'طارق زياد', tier: 'platinum', sales: '€250,000', bookings: 3200 },
  ];

  const recentBookings = [
    { id: 'BK-1001', service: 'رحلة رأس محمد', agent: 'أحمد محمود', amount: '€60', status: 'مؤكد', time: 'منذ 5 دقائق' },
    { id: 'BK-1002', service: 'باكدج الأقصر', agent: 'سارة إبراهيم', amount: '€350', status: 'قيد الانتظار', time: 'منذ 15 دقيقة' },
    { id: 'BK-1003', service: 'سفاري رباعي الدفع', agent: 'مباشر', amount: '€40', status: 'مكتمل', time: 'منذ ساعة' },
    { id: 'BK-1004', service: 'عشاء رومانسي', agent: 'خالد عبد الرحمن', amount: '€80', status: 'مؤكد', time: 'منذ ساعتين' },
  ];

  return (
    <div className={styles.dashboard}>
      <div className={`${styles.kpiGrid} stagger-children`}>
        {kpis.map((kpi, idx) => (
          <div key={idx} className={`${styles.kpiCard} glass-card`}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>{kpi.label}</span>
              <div className={styles.kpiIconWrapper} data-color={kpi.color}>
                <span className={styles.kpiIcon}>{kpi.icon}</span>
              </div>
            </div>
            <div className={styles.kpiValue}>{kpi.value}</div>
            <div className={styles.kpiTrend}>
              <span className={styles.trendUp}>↗ {kpi.trend}</span>
              <span className={styles.trendText}>مقارنة بالشهر الماضي</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.grid2Col}>
        <div className={`${styles.chartCard} glass-card animate-fade-in-up`}>
          <div className={styles.cardHeader}>
            <h3>الإيرادات السنوية</h3>
            <select className={styles.select}>
              <option>2026</option>
              <option>2025</option>
            </select>
          </div>
          <div className={styles.chartContainer}>
            <div className={styles.barWrap}><div className={styles.bar} style={{height: '40%'}}></div><span>يناير</span></div>
            <div className={styles.barWrap}><div className={styles.bar} style={{height: '45%'}}></div><span>فبراير</span></div>
            <div className={styles.barWrap}><div className={styles.bar} style={{height: '35%'}}></div><span>مارس</span></div>
            <div className={styles.barWrap}><div className={styles.bar} style={{height: '60%'}}></div><span>أبريل</span></div>
            <div className={styles.barWrap}><div className={styles.bar} style={{height: '80%'}}></div><span>مايو</span></div>
            <div className={styles.barWrap}><div className={styles.bar} style={{height: '75%'}}></div><span>يونيو</span></div>
            <div className={styles.barWrap}><div className={styles.bar} style={{height: '90%'}}></div><span>يوليو</span></div>
            <div className={styles.barWrap}><div className={styles.bar} style={{height: '100%'}}></div><span>أغسطس</span></div>
            <div className={styles.barWrap}><div className={styles.bar} style={{height: '85%'}}></div><span>سبتمبر</span></div>
            <div className={styles.barWrap}><div className={styles.bar} style={{height: '70%'}}></div><span>أكتوبر</span></div>
            <div className={styles.barWrap}><div className={styles.bar} style={{height: '50%'}}></div><span>نوفمبر</span></div>
            <div className={styles.barWrap}><div className={styles.bar} style={{height: '65%'}}></div><span>ديسمبر</span></div>
          </div>
        </div>

        <div className={styles.sideColumn}>
          <div className={`${styles.tableCard} glass-card animate-fade-in-up`} style={{ animationDelay: '0.1s' }}>
            <div className={styles.cardHeader}>
              <h3>أفضل الوكلاء مبيعاً</h3>
            </div>
            <div className={styles.agentsList}>
              {topAgents.map((agent, idx) => (
                <div key={agent.id} className={styles.agentRow}>
                  <div className={styles.agentRank}>#{idx + 1}</div>
                  <div className={styles.agentInfo}>
                    <h4>{agent.name}</h4>
                    <span className={`badge badge-${agent.tier === 'gold' ? 'gold' : agent.tier === 'silver' ? 'ocean' : agent.tier === 'platinum' ? 'emerald' : 'coral'}`}>
                      {agent.tier}
                    </span>
                  </div>
                  <div className={styles.agentSales}>
                    <div className={styles.salesAmount}>{agent.sales}</div>
                    <div className={styles.salesCount}>{agent.bookings} حجز</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`${styles.tableCard} glass-card animate-fade-in-up`} style={{ animationDelay: '0.2s' }}>
            <div className={styles.cardHeader}>
              <h3>أحدث الحجوزات</h3>
              <a href="/admin/bookings" className="btn btn-secondary btn-sm">عرض الكل</a>
            </div>
            <div className={styles.bookingsFeed}>
              {recentBookings.map((booking, idx) => (
                <div key={idx} className={styles.bookingItem}>
                  <div className={styles.bookingIcon}>🛎️</div>
                  <div className={styles.bookingDetails}>
                    <div className={styles.bookingHeader}>
                      <span className={styles.bookingService}>{booking.service}</span>
                      <span className={styles.bookingAmount}>{booking.amount}</span>
                    </div>
                    <div className={styles.bookingMeta}>
                      <span>{booking.agent}</span>
                      <span>•</span>
                      <span>{booking.time}</span>
                      <span className={`badge badge-${booking.status === 'مؤكد' ? 'emerald' : booking.status === 'مكتمل' ? 'ocean' : 'gold'}`} style={{ transform: 'scale(0.8)', marginInlineStart: 'auto' }}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
