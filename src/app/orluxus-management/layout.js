'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './layout.module.css';
import { useLanguage } from '@/context/LanguageContext';

// Admin panel translations for all 10 languages
const adminLabels = {
  en: {
    panelTitle: 'Admin Dashboard',
    dashboard: 'Dashboard',
    services: 'Manage Services',
    destinations: 'Manage Destinations',
    agents: 'Manage Agents',
    promoCodes: 'Promo Codes',
    tiers: 'Tier System',
    bookings: 'Bookings',
    reports: 'Reports',
    settings: 'Settings',
    backToSite: 'Back to Site',
    superAdmin: 'Super Admin',
    generalManager: 'General Manager',
  },
  ar: {
    panelTitle: 'لوحة تحكم الإدارة',
    dashboard: 'الرئيسية',
    services: 'إدارة الخدمات',
    destinations: 'إدارة المدن والوجهات',
    agents: 'إدارة الوكلاء',
    promoCodes: 'أكواد الخصم',
    tiers: 'نظام الترقيات',
    bookings: 'الحجوزات',
    reports: 'التقارير',
    settings: 'الإعدادات',
    backToSite: 'العودة للموقع',
    superAdmin: 'Super Admin',
    generalManager: 'المدير العام',
  },
  de: {
    panelTitle: 'Admin-Dashboard',
    dashboard: 'Startseite',
    services: 'Dienste verwalten',
    destinations: 'Reiseziele verwalten',
    agents: 'Agenten verwalten',
    promoCodes: 'Rabattcodes',
    tiers: 'Stufensystem',
    bookings: 'Buchungen',
    reports: 'Berichte',
    settings: 'Einstellungen',
    backToSite: 'Zurück zur Website',
    superAdmin: 'Super Admin',
    generalManager: 'Generaldirektor',
  },
  fr: {
    panelTitle: 'Tableau de Bord Admin',
    dashboard: 'Accueil',
    services: 'Gérer les services',
    destinations: 'Gérer les destinations',
    agents: 'Gérer les agents',
    promoCodes: 'Codes promo',
    tiers: 'Système de niveaux',
    bookings: 'Réservations',
    reports: 'Rapports',
    settings: 'Paramètres',
    backToSite: 'Retour au site',
    superAdmin: 'Super Admin',
    generalManager: 'Directeur Général',
  },
  es: {
    panelTitle: 'Panel de Administración',
    dashboard: 'Inicio',
    services: 'Gestionar servicios',
    destinations: 'Gestionar destinos',
    agents: 'Gestionar agentes',
    promoCodes: 'Códigos de descuento',
    tiers: 'Sistema de niveles',
    bookings: 'Reservas',
    reports: 'Informes',
    settings: 'Configuración',
    backToSite: 'Volver al sitio',
    superAdmin: 'Super Admin',
    generalManager: 'Director General',
  },
  it: {
    panelTitle: 'Pannello di Amministrazione',
    dashboard: 'Home',
    services: 'Gestisci servizi',
    destinations: 'Gestisci destinazioni',
    agents: 'Gestisci agenti',
    promoCodes: 'Codici sconto',
    tiers: 'Sistema livelli',
    bookings: 'Prenotazioni',
    reports: 'Report',
    settings: 'Impostazioni',
    backToSite: 'Torna al sito',
    superAdmin: 'Super Admin',
    generalManager: 'Direttore Generale',
  },
  ru: {
    panelTitle: 'Панель Администратора',
    dashboard: 'Главная',
    services: 'Управление услугами',
    destinations: 'Управление направлениями',
    agents: 'Управление агентами',
    promoCodes: 'Промокоды',
    tiers: 'Система уровней',
    bookings: 'Бронирования',
    reports: 'Отчёты',
    settings: 'Настройки',
    backToSite: 'Вернуться на сайт',
    superAdmin: 'Супер Администратор',
    generalManager: 'Генеральный Менеджер',
  },
  tr: {
    panelTitle: 'Yönetim Paneli',
    dashboard: 'Ana Sayfa',
    services: 'Hizmetleri Yönet',
    destinations: 'Destinasyonları Yönet',
    agents: 'Acenteleri Yönet',
    promoCodes: 'İndirim Kodları',
    tiers: 'Kademe Sistemi',
    bookings: 'Rezervasyonlar',
    reports: 'Raporlar',
    settings: 'Ayarlar',
    backToSite: 'Siteye Dön',
    superAdmin: 'Süper Admin',
    generalManager: 'Genel Müdür',
  },
  zh: {
    panelTitle: '管理员控制台',
    dashboard: '首页',
    services: '管理服务',
    destinations: '管理目的地',
    agents: '管理代理商',
    promoCodes: '折扣码',
    tiers: '等级系统',
    bookings: '预订管理',
    reports: '报告',
    settings: '设置',
    backToSite: '返回网站',
    superAdmin: '超级管理员',
    generalManager: '总经理',
  },
  ja: {
    panelTitle: '管理者ダッシュボード',
    dashboard: 'ホーム',
    services: 'サービス管理',
    destinations: '目的地管理',
    agents: 'エージェント管理',
    promoCodes: '割引コード',
    tiers: 'ティアシステム',
    bookings: '予約管理',
    reports: 'レポート',
    settings: '設定',
    backToSite: 'サイトに戻る',
    superAdmin: 'スーパー管理者',
    generalManager: '総支配人',
  },
};

export default function AdminLayout({ children }) {
  const { locale } = useLanguage();
  const aL = adminLabels[locale] || adminLabels.en;
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
    name: aL.generalManager,
    role: aL.superAdmin,
  };

  const navItems = [
    { name: aL.dashboard, href: '/orluxus-management', icon: '◈' },
    { name: aL.services, href: '/orluxus-management/services', icon: '◇' },
    { name: aL.destinations, href: '/orluxus-management/destinations', icon: '🌍' },
    { name: aL.agents, href: '/orluxus-management/agents', icon: '◉' },
    { name: aL.promoCodes, href: '/orluxus-management/promo-codes', icon: '◐' },
    { name: aL.tiers, href: '/orluxus-management/tiers', icon: '◆' },
    { name: aL.bookings, href: '/orluxus-management/bookings', icon: '▣' },
    { name: aL.reports, href: '/orluxus-management/reports', icon: '▲' },
    { name: aL.settings, href: '/orluxus-management/settings', icon: '◎' },
    { name: aL.backToSite, href: '/', icon: '←' }
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
        <div className={styles.logoText}>{aL.panelTitle}</div>
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
            {navItems.find(item => item.href === pathname)?.name || aL.panelTitle}
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
