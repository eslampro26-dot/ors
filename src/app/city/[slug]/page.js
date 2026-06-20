'use client';

import { cities, getLocalizedCity, getCategoryName } from '@/lib/data';
import Link from 'next/link';
import Navbar from '@/components/navigation/Navbar';
import { notFound, useParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

export default function CityPage() {
  const { slug } = useParams();
  const city = cities.find(c => c.slug === slug);
  const { locale, t, isReady } = useLanguage();

  if (!city) {
    notFound();
  }

  const locCity = getLocalizedCity(city, locale);

  if (!isReady) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading Destination...</div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', paddingBottom: '4rem', background: 'transparent' }}>
      <Navbar />
      
      {/* 1. LARGE HIGH-IMPACT HERO BANNER */}
      <div style={{
        minHeight: '60vh',
        paddingTop: 'calc(var(--nav-height) + 2rem)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        position: 'relative',
        backgroundImage: `linear-gradient(to bottom, rgba(9, 13, 22, 0.75) 0%, rgba(9, 13, 22, 0.4) 50%, rgba(9, 13, 22, 0.85) 100%), url(${city.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: '#ffffff',
        overflow: 'hidden'
      }}>
        {/* Glow Effects */}
        <div style={{
          position: 'absolute',
          top: '20%',
          right: '15%',
          width: '250px',
          height: '250px',
          background: 'var(--gold-500)',
          filter: 'blur(120px)',
          opacity: 0.2,
          borderRadius: '50%'
        }}></div>

        <div className="container animate-fade-in-up" style={{ position: 'relative', zIndex: 10, paddingBlock: '3rem' }}>
          <span className="badge badge-gold" style={{ marginBottom: '1.5rem', fontSize: 'var(--font-size-sm)', letterSpacing: '2px', background: 'rgba(251, 191, 36, 0.25)', border: '1px solid var(--gold-400)' }}>
            {t('common.viewAll').toUpperCase()} - {siteTitle()}
          </span>
          <h1 className="section-title" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '900', color: '#ffffff', textShadow: '0 4px 12px rgba(0,0,0,0.5)', marginBottom: '1rem' }}>
            {locCity.name}
          </h1>
          <p style={{ 
            fontSize: 'clamp(1rem, 2vw, 1.25rem)', 
            maxWidth: '700px', 
            margin: '0 auto', 
            lineHeight: '1.6', 
            color: 'rgba(255, 255, 255, 0.9)', 
            textShadow: '0 2px 8px rgba(0,0,0,0.6)',
            fontWeight: '500'
          }}>
            {locCity.description}
          </p>
        </div>

        {/* Animated Wave Transition Divider */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', overflow: 'hidden', height: '60px', pointerEvents: 'none', zIndex: 11 }}>
          <svg viewBox="0 0 1440 74" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
            <path className="animated-wave-1" d="M0 24C120 24 240 40 360 40C480 40 600 8 720 8C840 8 960 48 1080 48C1200 48 1320 16 1440 16V74H0V24Z" fill="var(--bg-primary)" opacity="0.3"/>
            <path className="animated-wave-2" d="M0 34C120 34 240 18 360 18C480 18 600 42 720 42C840 42 960 12 1080 12C1200 12 1320 30 1440 30V74H0V34Z" fill="var(--bg-primary)" opacity="0.5"/>
            <path className="animated-wave-3" d="M0 44C120 44 240 32 360 32C480 32 600 14 720 14C840 14 960 38 1080 38C1200 38 1320 20 1440 20V74H0V44Z" fill="var(--bg-primary)"/>
          </svg>
        </div>
      </div>

      {/* 2. SERVICES GRID */}
      <div className="container" style={{ marginTop: '4.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ color: 'var(--gold-600)', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block', fontSize: 'var(--font-size-sm)' }}>
            {t('common.selectCategory')}
          </span>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--text-primary)', fontWeight: '800' }}>
            {t('common.selectCategory')}
          </h2>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 'var(--space-lg)'
        }}>
          {city.categories.map((cat, idx) => {
            const categoryName = getCategoryName(cat.id, locale);
            
            return (
              <Link 
                key={cat.id} 
                href={`/city/${city.slug}/${cat.id}`}
                className="category-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.2rem',
                  textDecoration: 'none',
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--gradient-card)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-md)',
                  transition: 'all var(--transition-base)',
                  animation: `fadeInUp 0.5s ease-out ${idx * 0.08}s both`,
                  position: 'relative',
                  overflow: 'hidden',
                  flexDirection: locale === 'ar' ? 'row-reverse' : 'row'
                }}
              >
                {/* Accent line */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: locale === 'ar' ? 'auto' : 0,
                  right: locale === 'ar' ? 0 : 'auto',
                  width: '4px',
                  height: '100%',
                  background: 'var(--gradient-gold)',
                  borderRadius: '4px 0 0 4px',
                  transition: 'width var(--transition-base)'
                }} className="accent-line"></div>

                <div style={{ flex: 1, textAlign: locale === 'ar' ? 'right' : 'left' }}>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: 0, fontWeight: '700' }}>
                    {categoryName}
                  </h3>
                </div>
                <div style={{ 
                  color: 'var(--gold-500)', 
                  fontSize: '1.2rem', 
                  transition: 'transform var(--transition-base)',
                  transform: locale === 'ar' ? 'rotate(180deg)' : 'none'
                }} className="cat-arrow">
                  →
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <style jsx global>{`
        .category-card:hover {
          transform: translateY(-4px);
          border-color: var(--gold-400) !important;
          box-shadow: var(--shadow-lg) !important;
        }
        .category-card:hover .accent-line {
          width: 6px !important;
        }
        .category-card:hover .cat-arrow {
          transform: ${locale === 'ar' ? 'translateX(-5px) rotate(180deg)' : 'translateX(5px)'};
          color: var(--gold-600);
        }
        
        .animated-wave-1 {
          animation: wave-sway 18s ease-in-out infinite alternate;
        }
        .animated-wave-2 {
          animation: wave-sway 12s ease-in-out infinite alternate-reverse;
        }
        .animated-wave-3 {
          animation: wave-sway 8s ease-in-out infinite alternate;
        }
        
        @keyframes wave-sway {
          0% { transform: translateX(0); }
          100% { transform: translateX(-40px); }
        }
      `}</style>
    </main>
  );

  function siteTitle() {
    return locale === 'ar' ? 'أورلوكسوس' : 'ORLUXUS';
  }
}
