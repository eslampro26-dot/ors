'use client';

import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { cities, getLocalizedCity, getCategoryName } from '@/lib/data';
import { cityArticles } from '@/lib/cityArticles';
import Navbar from '@/components/navigation/Navbar';
import Link from 'next/link';

export default function CityGuidePage() {
  const { slug } = useParams();
  const router = useRouter();
  const { locale, t, isReady } = useLanguage();

  const city = cities.find(c => c.slug === slug);
  const isAr = locale === 'ar';

  if (!city) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B0B0B', color: '#fff' }}>
        <div>Destination not found</div>
      </main>
    );
  }

  const locCity = getLocalizedCity(city, locale);
  const article = cityArticles[slug]?.[locale] || cityArticles[slug]?.['en'] || cityArticles[slug]?.['ar'];

  if (!isReady) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B0B0B', color: '#fff' }}>
        <div style={{ color: 'var(--gold-500)', fontSize: '1.2rem', fontFamily: 'var(--font-title)' }}>
          {isAr ? 'جاري تحميل الدليل...' : 'Loading Guide...'}
        </div>
      </main>
    );
  }

  // Fallback if article does not exist
  if (!article) {
    return (
      <main style={{ minHeight: '100vh', background: '#0B0B0B', color: '#fff' }}>
        <Navbar />
        <div className="container" style={{ paddingTop: 'calc(var(--nav-height) + 4rem)', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-title)', color: 'var(--gold-500)', marginBottom: '2rem' }}>
            {locCity.name}
          </h1>
          <p>{isAr ? 'الدليل السياحي الكامل لهذه الوجهة قيد الإنشاء حالياً.' : 'The comprehensive guide for this destination is under construction.'}</p>
          <Link href={`/city/${slug}`} className="btn btn-primary" style={{ marginTop: '2rem', display: 'inline-flex' }}>
            {t('common.backToCity')}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0B0B0B', color: '#FFFFFF', paddingBottom: '5rem' }}>
      <Navbar />

      {/* Hero Header */}
      <div style={{
        paddingTop: 'calc(var(--nav-height) + 4rem)',
        paddingBottom: '3rem',
        backgroundImage: `linear-gradient(to bottom, rgba(11, 11, 11, 0.85) 0%, rgba(11, 11, 11, 0.95) 100%), url(${city.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'relative'
      }}>
        {/* Gold Glow decoration */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '350px',
          height: '350px',
          background: 'var(--gold-500)',
          filter: 'blur(150px)',
          opacity: 0.1,
          pointerEvents: 'none'
        }}></div>

        <div className="container" style={{ position: 'relative', zIndex: 10, textAlign: isAr ? 'right' : 'left' }}>
          <Link 
            href={`/city/${slug}`}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              color: 'var(--gold-500)', 
              textDecoration: 'none', 
              fontSize: '0.95rem',
              fontWeight: '600',
              marginBottom: '2rem',
              flexDirection: isAr ? 'row-reverse' : 'row'
            }}
          >
            <span>{isAr ? '←' : '←'}</span>
            <span>{t('common.backToCity')}</span>
          </Link>

          <span style={{ 
            color: 'var(--gold-400)', 
            fontWeight: '700', 
            letterSpacing: '3px', 
            textTransform: 'uppercase', 
            fontSize: 'var(--font-size-xs)',
            display: 'block',
            marginBottom: '0.5rem'
          }}>
            {isAr ? 'الدليل الحصري والشامل للزوار' : 'EXCLUSIVE TRAVEL GUIDE'}
          </span>
          <h1 style={{ 
            fontSize: 'clamp(2rem, 5vw, 3rem)', 
            fontFamily: 'var(--font-title)', 
            color: '#FFFFFF', 
            fontWeight: '900', 
            lineHeight: '1.2',
            margin: '0 0 1rem 0'
          }}>
            {article.title}
          </h1>
          <p style={{ 
            color: 'var(--gold-500)', 
            fontSize: '1.2rem', 
            fontStyle: 'italic',
            margin: 0,
            fontFamily: 'var(--font-title)'
          }}>
            {article.subtitle}
          </p>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="container" style={{ marginTop: '3.5rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '3rem',
          alignItems: 'start',
          // Desktop sidebar layout
          '@media (min-width: 992px)': {
            gridTemplateColumns: '7fr 3fr'
          }
        }} className="guide-grid">
          
          {/* Main Article Content */}
          <div style={{ textAlign: isAr ? 'right' : 'left' }}>
            {/* Introduction paragraph */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              padding: '2rem',
              borderRadius: '16px',
              marginBottom: '2.5rem',
              lineHeight: '1.7',
              fontSize: '1.15rem',
              color: 'rgba(255, 255, 255, 0.95)',
              position: 'relative'
            }}>
              <span style={{
                position: 'absolute',
                top: '-15px',
                right: isAr ? '30px' : 'auto',
                left: isAr ? 'auto' : '30px',
                background: '#0B0B0B',
                padding: '0 10px',
                color: 'var(--gold-500)',
                fontWeight: '700',
                fontSize: '0.85rem',
                letterSpacing: '1px'
              }}>{isAr ? 'مقدمة الدليل' : 'INTRODUCTION'}</span>
              {article.introduction}
            </div>

            {/* Chapters list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
              {article.chapters.map((ch, idx) => (
                <section 
                  key={idx} 
                  id={`chapter-${idx}`}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    paddingBottom: '2.5rem'
                  }}
                >
                  <h2 style={{
                    fontFamily: 'var(--font-title)',
                    color: 'var(--gold-500)',
                    fontSize: '1.75rem',
                    fontWeight: '700',
                    marginBottom: '1.2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    flexDirection: isAr ? 'row-reverse' : 'row'
                  }}>
                    <span style={{ fontSize: '1.1rem', opacity: 0.5, fontFamily: 'var(--font-en)' }}>0{idx + 1}</span>
                    <span>{ch.title}</span>
                  </h2>
                  <div style={{
                    lineHeight: '1.8',
                    fontSize: '1.05rem',
                    color: 'rgba(255, 255, 255, 0.85)',
                    whiteSpace: 'pre-line' // Preserve line breaks
                  }}>
                    {ch.content}
                  </div>
                </section>
              ))}
            </div>

            {/* Conclusion */}
            {article.conclusion && (
              <div style={{
                marginTop: '3.5rem',
                borderTop: '2px solid var(--gold-500)',
                paddingTop: '2rem'
              }}>
                <h3 style={{ fontFamily: 'var(--font-title)', color: 'var(--gold-400)', fontSize: '1.4rem', marginBottom: '1rem' }}>
                  {isAr ? 'خاتمة الدليل' : 'Conclusion'}
                </h3>
                <p style={{ lineHeight: '1.7', color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.05rem' }}>
                  {article.conclusion}
                </p>
              </div>
            )}

            {/* Sources & SEO Technical Tip */}
            <div style={{ marginTop: '3rem', fontSize: '0.85rem', color: 'var(--text-tertiary)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
              <p style={{ margin: '0 0 10px 0' }}>{article.sources}</p>
              <p style={{ margin: 0, fontStyle: 'italic' }}>
                {isAr 
                  ? 'تمت مراجعة هذا الدليل وتحسينه لتسهيل محركات البحث والأرشفة (SEO).' 
                  : 'This guide has been verified and optimized for Search Engine Indexing (SEO).'}
              </p>
            </div>
          </div>

          {/* Sticky Sidebar / القوائم الجانبية */}
          <div className="guide-sidebar">
            <div style={{
              position: 'sticky',
              top: 'calc(var(--nav-height) + 2rem)',
              display: 'flex',
              flexDirection: 'column',
              gap: '2rem'
            }}>
              {/* Table of Contents */}
              <div style={{
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '16px',
                padding: '1.5rem',
                textAlign: isAr ? 'right' : 'left'
              }}>
                <h3 style={{ fontFamily: 'var(--font-title)', color: '#FFFFFF', fontSize: '1.15rem', marginBottom: '1.2rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {isAr ? 'فصول الدليل' : 'Guide Chapters'}
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {article.chapters.map((ch, idx) => (
                    <li key={idx}>
                      <a 
                        href={`#chapter-${idx}`}
                        style={{
                          color: 'var(--text-secondary)',
                          textDecoration: 'none',
                          fontSize: '0.9rem',
                          transition: 'color 0.2s',
                          display: 'block'
                        }}
                        onMouseEnter={(e) => e.target.style.color = 'var(--gold-400)'}
                        onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                      >
                        {ch.title.split(':')[0] || `Chapter ${idx + 1}`}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* City Lists / القوائم الجانبية للمدينة */}
              <div style={{
                background: 'var(--gradient-card)',
                border: '1px solid var(--gold-500)',
                boxShadow: 'var(--shadow-glow-gold)',
                borderRadius: '16px',
                padding: '1.5rem',
                textAlign: isAr ? 'right' : 'left'
              }}>
                <h3 style={{ fontFamily: 'var(--font-title)', color: 'var(--gold-400)', fontSize: '1.15rem', marginBottom: '0.5rem' }}>
                  {isAr ? `قوائم ${locCity.name} السياحية` : `${locCity.name} Services`}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>
                  {isAr 
                    ? `تصفح واحجز مباشرة من القوائم الحصرية لمدينة ${locCity.name} فقط:` 
                    : `Browse and book from exclusive lists for ${locCity.name} only:`}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {city.categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/city/${city.slug}/${cat.id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        transition: 'all 0.2s',
                        flexDirection: isAr ? 'row-reverse' : 'row'
                      }}
                      className="sidebar-category-link"
                    >
                      <span>{getCategoryName(cat.id, locale)}</span>
                      <span style={{ color: 'var(--gold-500)' }}>{isAr ? '←' : '→'}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Return to City Page */}
              <Link 
                href={`/city/${slug}`}
                className="btn btn-secondary"
                style={{ 
                  textAlign: 'center', 
                  justifyContent: 'center', 
                  borderColor: 'var(--gold-500)', 
                  color: 'var(--gold-400)',
                  fontWeight: 'bold'
                }}
              >
                {t('common.backToCity')}
              </Link>

            </div>
          </div>

        </div>
      </div>

      {/* Global Sidebar & Responsive Styles */}
      <style jsx global>{`
        .guide-grid {
          display: grid;
          grid-template-columns: 1fr;
        }
        @media (min-width: 992px) {
          .guide-grid {
            grid-template-columns: 7.5fr 3.5fr !important;
          }
        }
        .sidebar-category-link:hover {
          background: rgba(201, 162, 39, 0.08) !important;
          border-color: var(--gold-500) !important;
          transform: translateX(${isAr ? '-4px' : '4px'});
        }
      `}</style>
    </main>
  );
}
