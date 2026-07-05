'use client';

import Navbar from '@/components/navigation/Navbar';
import { useLanguage } from '@/context/LanguageContext';

export default function EntertainmentPage() {
  const { locale, isReady } = useLanguage();

  if (!isReady) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading...</div>
      </main>
    );
  }

  const isAr = locale === 'ar';

  return (
    <main style={{ minHeight: '100vh', paddingBottom: '4rem', background: 'transparent' }}>
      <Navbar />
      
      {/* Hero */}
      <div style={{
        paddingTop: 'calc(var(--nav-height) + 4rem)',
        paddingBottom: '4rem',
        textAlign: 'center',
        background: 'var(--gradient-hero)',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div className="container animate-fade-in-up">
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎭</div>
          <h1 className="section-title">{isAr ? 'ترفيهي' : 'Entertainment'}</h1>
          <p className="section-subtitle">
            {isAr ? 'أهم الفعاليات والحفلات الترفيهية في جميع أنحاء مصر' : 'The most important events and entertainment shows across Egypt'}
          </p>
        </div>
      </div>

      <div className="container" style={{ marginTop: '3rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2rem',
          flexDirection: isAr ? 'row-reverse' : 'row'
        }}>
          <h2 style={{ fontSize: 'var(--font-size-xl)' }}>{isAr ? 'الفعاليات المتاحة' : 'Available Events'}</h2>
        </div>

        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem', opacity: 0.5 }}>🎟️</span>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
            {isAr ? 'لا توجد فعاليات مضافة حالياً في هذا القسم' : 'No events currently added in this section'}
          </h3>

        </div>
      </div>
    </main>
  );
}
