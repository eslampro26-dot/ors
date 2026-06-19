
'use client';

/**
 * Dynamic Imports Registry
 * Phase 4: Performance - Centralized dynamic imports for code splitting
 * 
 * Usage:
 *   import { DynamicCheckout, DynamicReviews } from '@/lib/dynamic-imports';
 *   <DynamicCheckout /> or <DynamicReviews />
 */

import dynamic from 'next/dynamic';

// ─── Skeleton Loaders ───
const PageSkeleton = () => (
  <div style={{
    minHeight: '60vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-primary)',
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '48px',
        height: '48px',
        border: '3px solid var(--border-subtle)',
        borderTopColor: 'var(--gold-500)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        margin: '0 auto 1rem',
      }} />
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>Loading...</p>
    </div>
  </div>
);

const SmallSkeleton = () => (
  <div style={{
    height: '200px',
    background: 'linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-secondary) 50%, var(--bg-tertiary) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '12px',
  }}>
    <style jsx>{`
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  </div>
);

// ─── Page-level Dynamic Imports (heavy components) ───

export const DynamicCheckout = dynamic(
  () => import('@/app/checkout/page'),
  { loading: PageSkeleton, ssr: false }
);

export const DynamicReviews = dynamic(
  () => import('@/app/reviews/page'),
  { loading: PageSkeleton, ssr: false }
);

// ─── Component-level Dynamic Imports ───

export const DynamicNavbar = dynamic(
  () => import('@/components/navigation/Navbar'),
  { loading: () => <div style={{ height: '70px', background: 'var(--bg-secondary)' }} />, ssr: false }
);

export const DynamicSplashScreen = dynamic(
  () => import('@/components/SplashScreen'),
  { loading: () => null, ssr: false }
);

export const DynamicLanguageSwitcher = dynamic(
  () => import('@/components/navigation/LanguageSwitcher'),
  { loading: () => <div style={{ width: '80px', height: '36px' }} />, ssr: false }
);

// ─── Management Panel Dynamic Imports ───

export const DynamicManagementDashboard = dynamic(
  () => import('@/app/orluxus-management/page'),
  { loading: PageSkeleton, ssr: false }
);

export const DynamicManagementServices = dynamic(
  () => import('@/app/orluxus-management/services/page'),
  { loading: PageSkeleton, ssr: false }
);

export const DynamicManagementBookings = dynamic(
  () => import('@/app/orluxus-management/bookings/page'),
  { loading: PageSkeleton, ssr: false }
);

export const DynamicManagementAgents = dynamic(
  () => import('@/app/orluxus-management/agents/page'),
  { loading: PageSkeleton, ssr: false }
);

export const DynamicManagementPromoCodes = dynamic(
  () => import('@/app/orluxus-management/promo-codes/page'),
  { loading: PageSkeleton, ssr: false }
);

export const DynamicManagementReports = dynamic(
  () => import('@/app/orluxus-management/reports/page'),
  { loading: PageSkeleton, ssr: false }
);

export const DynamicManagementSettings = dynamic(
  () => import('@/app/orluxus-management/settings/page'),
  { loading: PageSkeleton, ssr: false }
);
