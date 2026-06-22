'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './layout.module.css';
import { tierConfig } from '@/lib/data';

export default function AgentLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Real agent state
  const [agent, setAgent] = useState({
    id: null,
    name: 'جاري التحميل...',
    tier: 'bronze',
    balance: '€0'
  });

  // Verify session with server on every page load
  useEffect(() => {
    if (pathname === '/agent/login') {
      setIsLoading(false);
      return;
    }
    
    const verifySession = async () => {
      try {
        const res = await fetch('/api/auth/agent-me', { credentials: 'include' });
        if (!res.ok) {
          // Not authenticated - redirect to login
          router.replace('/agent/login');
          return;
        }
        const data = await res.json();
        if (data.agent) {
          setAgent({
            id: data.agent.id,
            name: data.agent.name,
            tier: data.agent.tier || 'bronze',
            balance: '€0' // placeholder, KPIs load per-page
          });
          setIsAuthenticated(true);
        }
      } catch {
        router.replace('/agent/login');
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, [pathname, router]);

  if (pathname === '/agent/login') {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        جاري التحميل...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Router will handle redirect
  }

  const navItems = [
    { name: 'لوحة التحكم', href: '/agent', icon: '◈' },
    { name: 'مبيعاتي', href: '/agent/sales', icon: '◆' },
    { name: 'العودة للرئيسية', href: '/', icon: '←' }
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {}
    // Clear any display info from sessionStorage
    sessionStorage.removeItem('agent_display');
    router.replace('/agent/login');
  };

  return (
    <div className={styles.agentLayout}>
      
      {/* Mobile Header */}
      <div className={styles.mobileHeader} style={{ display: 'none' }}>
        {/* Helper layout fallback in case mobile classes render */}
      </div>

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarLogo}>ORLUXUS AGENT</div>
          <div className={styles.sidebarLogoSub}>بوابة الوكيل المعتمد</div>
        </div>

        <nav className={styles.sidebarNav}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.name}</span>
              </Link>
            );
          })}
          
          <button 
            onClick={handleLogout} 
            className={styles.navItem} 
            style={{ width: '100%', border: 'none', background: 'none', textAlign: 'right', cursor: 'pointer', color: 'var(--coral-400)', marginTop: 'auto' }}
          >
            <span className={styles.navIcon}>←</span>
            <span className={styles.navLabel}>تسجيل الخروج</span>
          </button>
        </nav>

        {/* Sidebar Footer displaying agent profile */}
        <div className={styles.sidebarFooter}>
          <div className={styles.agentMiniCard}>
            <div className={styles.agentAvatar}>{agent.name.charAt(0)}</div>
            <div className={styles.agentMiniInfo}>
              <div className={styles.agentMiniName}>{agent.name}</div>
              <div className={styles.agentMiniTier}>
                {tierConfig[agent.tier]?.nameAr || 'برونزي'} وكيل
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Area Content */}
      <main className={styles.mainArea}>
        <header className={styles.topBar}>
          <div className={styles.topBarRight}>
            <button className={styles.menuToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
              ☰
            </button>
            <h1 className={styles.pageTitle}>
              {navItems.find(item => item.href === pathname)?.name || 'بوابة الوكلاء'}
            </h1>
          </div>
          
          <div className={styles.topBarLeft}>
            <div className={styles.agentGreeting}>
              <span className={styles.greetingText}>مرحباً بك،</span>
              <span className={styles.greetingName}>{agent.name}</span>
              <span className={styles.tierBadge} style={{ 
                background: `rgba(${agent.tier === 'platinum' ? '16,185,129' : agent.tier === 'gold' ? '251,191,36' : agent.tier === 'silver' ? '148,163,184' : '205,127,50'}, 0.12)`,
                color: agent.tier === 'platinum' ? 'var(--emerald-400)' : agent.tier === 'gold' ? 'var(--gold-400)' : agent.tier === 'silver' ? '#94a3b8' : '#cd7f32',
                border: `1px solid rgba(${agent.tier === 'platinum' ? '16,185,129' : agent.tier === 'gold' ? '251,191,36' : agent.tier === 'silver' ? '148,163,184' : '205,127,50'}, 0.25)`
              }}>
                {tierConfig[agent.tier]?.nameAr || 'برونزي'} وكيل
              </span>
            </div>
            
            <button className={styles.notifBtn}>
              ◉
              <span className={styles.notifDot}></span>
            </button>
          </div>
        </header>
        
        {/* Dynamic page injected here inside perfect styled wrapper */}
        <div className={styles.content}>
          {children}
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      <div 
        className={`${styles.overlay} ${sidebarOpen ? styles.overlayVisible : ''}`} 
        onClick={() => setSidebarOpen(false)}
      ></div>
      
    </div>
  );
}
