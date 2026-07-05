'use client';

import { useState } from 'react';
import { cities, getLocalizedCity, getCategoryName } from '@/lib/data';
import { cityArticles } from '@/lib/cityArticles';
import Link from 'next/link';
import Navbar from '@/components/navigation/Navbar';
import { notFound, useParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

export default function CityPage() {
  const { slug } = useParams();
  const city = cities.find(c => c.slug === slug);
  const { locale, t, isReady } = useLanguage();
  const [showGuideModal, setShowGuideModal] = useState(false);

  if (!city) {
    notFound();
  }

  const locCity = getLocalizedCity(city, locale);
  const article = cityArticles[slug]?.[locale] || cityArticles[slug]?.['en'];

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

      {/* City Guide Button — Compact & Clickable */}
      {article && (
        <div className="container animate-fade-in-up" style={{ marginTop: '3rem' }}>
          <div
            onClick={() => setShowGuideModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.5rem',
              background: 'linear-gradient(135deg, rgba(201,162,39,0.08) 0%, rgba(201,162,39,0.03) 100%)',
              border: '1px solid rgba(201,162,39,0.3)',
              borderRadius: '16px',
              padding: '1.2rem 2rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              flexDirection: locale === 'ar' ? 'row-reverse' : 'row',
              boxShadow: '0 4px 20px rgba(201,162,39,0.08)',
            }}
            className="guide-btn-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexDirection: locale === 'ar' ? 'row-reverse' : 'row' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--gold-500), var(--gold-600))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.2rem', flexShrink: 0
              }}>📖</div>
              <div style={{ textAlign: locale === 'ar' ? 'right' : 'left' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--gold-500)', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '2px' }}>
                  {locale === 'ar' ? 'دليل المدينة' : 'CITY GUIDE'}
                </div>
                <div style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: '700' }}>
                  {locale === 'ar' ? `دليل السفر الشامل لـ ${locCity.name}` : `Complete Travel Guide — ${locCity.name}`}
                </div>
              </div>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'var(--gold-500)', color: '#fff',
              padding: '8px 20px', borderRadius: '999px',
              fontWeight: '700', fontSize: '0.85rem', flexShrink: 0,
              flexDirection: locale === 'ar' ? 'row-reverse' : 'row'
            }}>
              <span>{locale === 'ar' ? 'اقرأ الدليل' : 'Read Guide'}</span>
              <span style={{ fontSize: '1rem', transform: locale === 'ar' ? 'rotate(180deg)' : 'none' }}>→</span>
            </div>
          </div>
        </div>
      )}

      {/* City Guide Modal */}
      {showGuideModal && article && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 7, 12, 0.9)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-accent)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '850px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2.5rem',
            position: 'relative',
            direction: locale === 'ar' ? 'rtl' : 'ltr',
            textAlign: locale === 'ar' ? 'right' : 'left'
          }}>
            <button 
              onClick={() => setShowGuideModal(false)}
              style={{
                position: 'absolute',
                top: '1.5rem',
                [locale === 'ar' ? 'left' : 'right']: '1.5rem',
                fontSize: '1.8rem',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                lineHeight: 1
              }}
            >
              ×
            </button>
            <h2 style={{ fontSize: '2rem', color: 'var(--gold-400)', fontWeight: '900', marginBottom: '0.5rem' }}>
              {article.title}
            </h2>
            <h4 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', fontWeight: '500', marginBottom: '2rem' }}>
              {article.subtitle}
            </h4>
            <p style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--text-primary)', marginBottom: '2rem' }}>
              {article.introduction}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {article.chapters.map((ch, idx) => (
                <div key={idx} style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--gold-500)', fontWeight: '800', marginBottom: '1rem' }}>
                    {ch.title}
                  </h3>
                  <p style={{ fontSize: '1rem', lineHeight: '1.7', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
                    {ch.content}
                  </p>
                </div>
              ))}
            </div>

            {article.conclusion && (
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem', marginTop: '2rem' }}>
                <p style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--text-primary)', fontWeight: 'bold' }}>
                  {article.conclusion}
                </p>
              </div>
            )}
            
            {article.sources && (
              <div style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                {article.sources}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. SERVICES GRID */}
      <div className="container" style={{ marginTop: '4rem' }}>
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
