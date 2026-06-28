'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './layout.module.css';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check auth - instant render, redirect only if truly unauthenticated
  useEffect(() => {
    if (pathname === '/orluxus-management/login') {
      setIsChecking(false);
      setIsAuthenticated(true);
      return;
    }

    // Use AbortController for cleanup
    const controller = new AbortController();

    fetch('/api/auth/verify-admin', { 
      credentials: 'include',
      signal: controller.signal,
      cache: 'no-store'
    })
      .then((res) => {
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          router.replace('/orluxus-management/login');
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          router.replace('/orluxus-management/login');
        }
      })
      .finally(() => setIsChecking(false));

    return () => controller.abort();
  }, [pathname]);

  const admin = {
    name: 'المدير العام',
    role: 'Super Admin',
  };

  const navItems = [
    { name: 'الرئيسية', href: '/orluxus-management', icon: '◈' },
    { name: 'إدارة الخدمات', href: '/orluxus-management/services', icon: '◇' },
    { name: 'إدارة المدن والوجهات', href: '/orluxus-management/destinations', icon: '🌍' },
    { name: 'إدارة الوكلاء', href: '/orluxus-management/agents', icon: '◉' },
    { name: 'أكواد الخصم', href: '/orluxus-management/promo-codes', icon: '◐' },
    { name: 'نظام الترقيات', href: '/orluxus-management/tiers', icon: '◆' },
    { name: 'الحجوزات', href: '/orluxus-management/bookings', icon: '▣' },
    { name: 'التقارير', href: '/orluxus-management/reports', icon: '▲' },
    { name: 'الإعدادات', href: '/orluxus-management/settings', icon: '◎' },
    { name: 'العودة للموقع', href: '/', icon: '←' }
  ];

  if (pathname === '/orluxus-management/login') {
    return <>{children}</>;
  }

  // Show fast skeleton while checking auth (not a blank white screen)
  if (isChecking) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#05070c',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ 
          width: '48px', height: '48px', 
          border: '3px solid rgba(201,162,39,0.2)',
          borderTop: '3px solid #C9A227',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', fontFamily: 'sans-serif' }}>ORLUXUS Admin</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className={styles.adminContainer}>
      <div className={styles.mobileHeader}>
        <button className={styles.menuBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
          ☰
        </button>
        <div className={styles.logoText}>لوحة تحكم الإدارة</div>
      </div>

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.adminAvatar}>A</div>
          <div className={styles.adminInfo}>
            <div className={styles.adminName}>{admin.name}</div>
            <div className={styles.adminRole}>{admin.role}</div>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <a 
                key={item.href} 
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {item.name}
              </a>
            );
          })}
        </nav>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.topbar}>
          <h1 className={styles.pageTitle}>
            {navItems.find(item => item.href === pathname)?.name || 'لوحة التحكم'}
          </h1>
          <div className={styles.topbarActions}>
            <button className={styles.iconBtn}>◉ <span className={styles.badge}>3</span></button>
            <button className={styles.iconBtn}>✦</button>
          </div>
        </header>
        
        <div className={styles.contentArea}>
          {children}
        </div>
      </main>

      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)}></div>
      )}
    </div>
  );
}
