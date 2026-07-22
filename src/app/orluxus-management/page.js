'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { getAgents, getBookings } from '@/lib/db';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    activeAgents: 0,
    confirmedBookings: 0,
    monthRevenue: 0,
  });
  const [topAgents, setTopAgents] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [agents, bookings] = await Promise.all([
          getAgents(),
          getBookings(),
        ]);

        const allAgents = agents || [];
        const allBookings = bookings || [];

        // Compute real KPIs
        const activeBookings = allBookings.filter(b => {
          const status = (b.status || '').toLowerCase();
          return status !== 'ملغي' && status !== 'cancelled' && status !== 'قيد الانتظار' && status !== 'pending' && status !== 'جديد' && status !== 'new';
        });

        const totalRevenue = activeBookings.reduce((sum, b) => sum + (parseFloat(b.totalPrice) || parseFloat(b.price) || parseFloat(b.finalAmount) || 0), 0);
        const totalBookings = allBookings.length;
        const activeAgents = allAgents.filter(a => a.status === 'نشط' || a.status === 'active').length;
        const confirmedBookings = allBookings.filter(b => b.status === 'مؤكد' || b.status === 'confirmed').length;

        // This month revenue
        const now = new Date();
        const monthRevenue = activeBookings
          .filter(b => {
            const d = new Date(b.createdAt || b.date || 0);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          })
          .reduce((sum, b) => sum + (parseFloat(b.totalPrice) || parseFloat(b.price) || parseFloat(b.finalAmount) || 0), 0);

        setStats({ totalRevenue, totalBookings, activeAgents, confirmedBookings, monthRevenue });

        // Top agents by sales
        const agentMap = {};
        activeBookings.forEach(b => {
          if (b.agentId) {
            if (!agentMap[b.agentId]) agentMap[b.agentId] = { revenue: 0, bookings: 0 };
            agentMap[b.agentId].revenue += parseFloat(b.totalPrice) || parseFloat(b.price) || parseFloat(b.finalAmount) || 0;
            agentMap[b.agentId].bookings += 1;
          }
        });

        const sortedAgents = allAgents
          .map(a => ({
            ...a,
            totalSales: agentMap[a.id]?.revenue || 0,
            totalBookings: agentMap[a.id]?.bookings || 0,
          }))
          .sort((a, b) => b.totalSales - a.totalSales)
          .slice(0, 5);

        setTopAgents(sortedAgents);

        // Recent bookings (last 5)
        const sorted = [...allBookings].sort((a, b) => {
          return new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0);
        });
        setRecentBookings(sorted.slice(0, 5));

      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const formatCurrency = (val) => {
    if (val >= 1_000_000) return `€${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `€${(val / 1_000).toFixed(1)}K`;
    return `€${val.toFixed(0)}`;
  };

  const kpis = [
    { label: 'Total Revenue', value: loading ? '---' : formatCurrency(stats.totalRevenue), trend: '', icon: '◆', color: 'gold' },
    { label: 'Total Bookings', value: loading ? '---' : stats.totalBookings.toLocaleString(), trend: '', icon: '▣', color: 'ocean' },
    { label: 'Active Agents', value: loading ? '---' : stats.activeAgents.toString(), trend: '', icon: '◉', color: 'emerald' },
    { label: 'Confirmed Bookings', value: loading ? '---' : stats.confirmedBookings.toString(), trend: '', icon: '▲', color: 'coral' },
    { label: 'Current Month Revenue', value: loading ? '---' : formatCurrency(stats.monthRevenue), trend: '', icon: '◈', color: 'gold' },
    { label: 'Registered Agents', value: loading ? '---' : topAgents.length > 0 ? topAgents.length.toString() : '0', trend: '', icon: '◐', color: 'emerald' },
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
              <span className={styles.trendText}>
                {loading ? 'Loading...' : 'Calculated from Database'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.grid2Col}>
        <div className={`${styles.chartCard} glass-card animate-fade-in-up`}>
          <div className={styles.cardHeader}>
            <h3>Annual Revenue</h3>
            <select className={styles.select}>
              <option>2026</option>
              <option>2025</option>
            </select>
          </div>
          <div className={styles.chartContainer}>
            <div className={styles.barWrap}><div className={styles.bar} style={{height: '40%'}}></div><span>Jan</span></div>
            <div className={styles.barWrap}><div className={styles.bar} style={{height: '45%'}}></div><span>Feb</span></div>
            <div className={styles.barWrap}><div className={styles.bar} style={{height: '35%'}}></div><span>Mar</span></div>
            <div className={styles.barWrap}><div className={styles.bar} style={{height: '60%'}}></div><span>Apr</span></div>
            <div className={styles.barWrap}><div className={styles.bar} style={{height: '80%'}}></div><span>May</span></div>
            <div className={styles.barWrap}><div className={styles.bar} style={{height: '75%'}}></div><span>Jun</span></div>
            <div className={styles.barWrap}><div className={styles.bar} style={{height: '90%'}}></div><span>Jul</span></div>
            <div className={styles.barWrap}><div className={styles.bar} style={{height: '100%'}}></div><span>Aug</span></div>
            <div className={styles.barWrap}><div className={styles.bar} style={{height: '85%'}}></div><span>Sep</span></div>
            <div className={styles.barWrap}><div className={styles.bar} style={{height: '70%'}}></div><span>Oct</span></div>
            <div className={styles.barWrap}><div className={styles.bar} style={{height: '50%'}}></div><span>Nov</span></div>
            <div className={styles.barWrap}><div className={styles.bar} style={{height: '65%'}}></div><span>Dec</span></div>
          </div>
        </div>

        <div className={styles.sideColumn}>
          <div className={`${styles.tableCard} glass-card animate-fade-in-up`} style={{ animationDelay: '0.1s' }}>
            <div className={styles.cardHeader}>
              <h3>Top Performing Agents</h3>
            </div>
            <div className={styles.agentsList}>
              {loading && <div style={{ padding: '1rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>Loading...</div>}
              {!loading && topAgents.length === 0 && (
                <div style={{ padding: '1rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                  No sales data available yet
                </div>
              )}
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
                    <div className={styles.salesAmount}>{formatCurrency(agent.totalSales)}</div>
                    <div className={styles.salesCount}>{agent.totalBookings} bookings</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`${styles.tableCard} glass-card animate-fade-in-up`} style={{ animationDelay: '0.2s' }}>
            <div className={styles.cardHeader}>
              <h3>Recent Bookings</h3>
              <a href="/orluxus-management/bookings" className="btn btn-secondary btn-sm">View All</a>
            </div>
            <div className={styles.bookingsFeed}>
              {loading && <div style={{ padding: '1rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>Loading...</div>}
              {!loading && recentBookings.length === 0 && (
                <div style={{ padding: '1rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                  No bookings recorded yet
                </div>
              )}
              {recentBookings.map((booking, idx) => (
                <div key={idx} className={styles.bookingItem}>
                  <div className={styles.bookingIcon}>◎</div>
                  <div className={styles.bookingDetails}>
                    <div className={styles.bookingHeader}>
                      <span className={styles.bookingService}>{booking.tripTitle || booking.service || 'Booking'}</span>
                      <span className={styles.bookingAmount}>€{(parseFloat(booking.totalPrice) || parseFloat(booking.price) || 0).toFixed(0)}</span>
                    </div>
                    <div className={styles.bookingMeta}>
                      <span>{booking.customerName || booking.agent || 'Guest'}</span>
                      <span>•</span>
                      <span>{booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-US') : ''}</span>
                      <span className={`badge badge-${booking.status === 'مؤكد' || booking.status === 'confirmed' ? 'emerald' : booking.status === 'مكتمل' || booking.status === 'completed' ? 'ocean' : 'gold'}`} style={{ transform: 'scale(0.8)', marginInlineStart: 'auto' }}>
                        {booking.status || 'New'}
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
