'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './layout.module.css';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth via server-side session (fixes C-3: client-side auth bypass)
  useEffect(() => {
    if (pathname === '/orluxus-management/login') {
      setIsLoading(false);
      return;
    }

    // Verify session cookie on the server — cannot be faked from browser JS
    fetch('/api/auth/verify-admin', { credentials: 'include' })
      .then((res) => {
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          window.location.href = '/orluxus-management/login';
        }
      })
      .catch(() => {
        window.location.href = '/orluxus-management/login';
      })
      .finally(() => setIsLoading(false));
  }, [pathname]);

  const admin = {
    name: 'المدير العام',
    role: 'Super Admin',
  };

  const navItems = [
    { name: 'الرئيسية', href: '/orluxus-management', icon: '◈' },
    { name: 'إدارة الخدمات', href: '/orluxus-management/services', icon: '◇' },
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

  if (isLoading || !isAuthenticated) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>جاري التحميل...</div>;
  }

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
