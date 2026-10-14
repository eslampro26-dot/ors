'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/navigation/Navbar';
import { useLanguage } from '@/context/LanguageContext';
import TrustBadges from '@/components/TrustBadges';

const CATEGORIES = [
  { id: 'all', ar: 'الكل', en: 'All Partners', icon: '✨' },
  { id: 'hotel', ar: 'فنادق ومنتجعات', en: 'Hotels & Resorts', icon: '🏨' },
  { id: 'restaurant', ar: 'مطاعم فاخرة', en: 'Fine Dining', icon: '🍽️' },
  { id: 'yacht', ar: 'يخوت وأنشطة بحرية', en: 'Luxury Yachts', icon: '⛵' },
];

export default function PartnersPage() {
  const { locale } = useLanguage();
  const isAr = locale === 'ar';

  const [partners, setPartners] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const res = await fetch('/api/partners');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.partners) {
            setPartners(data.partners);
          }
        }
      } catch (err) {
        console.error('Failed to load partners:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPartners();
  }, []);

  const filteredPartners = partners.filter(p => {
    if (activeCategory === 'all') return true;
    return p.category === activeCategory;
  });

  return (
    <main
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary, #0a0e1a)',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Navbar />

      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          padding: 'clamp(5rem, 12vh, 8rem) 1.5rem 3rem',
          textAlign: 'center',
          background: 'radial-gradient(ellipse at top, rgba(201, 162, 39, 0.15) 0%, rgba(10, 14, 26, 0.95) 75%)',
          borderBottom: '1px solid rgba(201, 162, 39, 0.25)',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 16px',
              borderRadius: '25px',
              background: 'rgba(201, 162, 39, 0.12)',
              border: '1px solid rgba(201, 162, 39, 0.35)',
              color: 'var(--gold-400, #f6d063)',
              fontSize: '0.85rem',
              fontWeight: '800',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '1.2rem',
            }}
          >
            🤝 {isAr ? 'شبكة الشركاء المعتمدين' : 'Certified Official Partners'}
          </span>

          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.4rem)',
              fontWeight: '900',
              lineHeight: 1.2,
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, #ffffff 40%, var(--gold-400, #f6d063) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: 'var(--font-heading, inherit)',
            }}
          >
            {isAr ? 'شركاء الفخامة والضيافة المعتمدون' : 'Luxury Hospitality & Service Partners'}
          </h1>

          <p
            style={{
              fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
              color: 'rgba(255, 255, 255, 0.75)',
              lineHeight: 1.8,
              maxWidth: '750px',
              margin: '0 auto 1.8rem',
            }}
          >
            {isAr
              ? 'نعمل جنباً إلى جنب مع نخبة الفنادق الفاخرة، المطاعم العالمية، ومقدمي اليخوت والأنشطة البحرية المعتمدين لنضمن لضيوفنا تجربة استثنائية مع مزايا وخصومات حصرية.'
              : 'Partnering exclusively with top-tier luxury resorts, fine dining establishments, and certified private yacht providers to ensure an unparalleled experience with exclusive perks.'}
          </p>

          {/* Quick Transparency Note */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 18px',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '30px',
              color: '#34d399',
              fontSize: '0.86rem',
              fontWeight: '700',
            }}
          >
            <span>🔄</span>
            <span>
              {isAr
                ? 'مرونة كاملة: إلغاء مجاني حتى 24 ساعة وضمان استرداد 100%'
                : '100% Guarantee: Free cancellation up to 24h before activity'}
            </span>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <TrustBadges variant="default" showTitle={false} />

      {/* Main Content & Categories */}
      <section style={{ padding: '3rem 1.5rem 5rem', flex: 1, maxWidth: '1300px', margin: '0 auto', width: '100%' }}>
        {/* Category Filters */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '3rem',
          }}
        >
          {CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 22px',
                  borderRadius: '30px',
                  border: isActive ? '1.5px solid var(--gold-400, #f6d063)' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(201, 162, 39, 0.25) 0%, rgba(201, 162, 39, 0.1) 100%)'
                    : 'rgba(255, 255, 255, 0.03)',
                  color: isActive ? 'var(--gold-400, #f6d063)' : 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.92rem',
                  fontWeight: isActive ? '800' : '600',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: isActive ? '0 0 16px rgba(201, 162, 39, 0.2)' : 'none',
                }}
              >
                <span>{cat.icon}</span>
                <span>{isAr ? cat.ar : cat.en}</span>
              </button>
            );
          })}
        </div>

        {/* Partners Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'rgba(255, 255, 255, 0.6)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <div>{isAr ? 'جارٍ تحميل الشركاء...' : 'Loading partners...'}</div>
          </div>
        ) : filteredPartners.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              color: 'rgba(255, 255, 255, 0.6)',
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🏨</div>
            <p>{isAr ? 'لا يوجد شركاء في هذا التصنيف حالياً.' : 'No partners found in this category.'}</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '2rem',
            }}
          >
            {filteredPartners.map(partner => (
              <div
                key={partner.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.75)',
                  border: '1px solid rgba(201, 162, 39, 0.25)',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
                }}
              >
                {/* Image & Badge */}
                <div style={{ position: 'relative', width: '100%', height: '220px', overflow: 'hidden' }}>
                  <img
                    src={partner.image || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'}
                    alt={isAr ? partner.nameAr : partner.nameEn}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, transparent 60%)',
                    }}
                  />

                  {/* Category Tag */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '14px',
                      right: isAr ? '14px' : 'auto',
                      left: isAr ? 'auto' : '14px',
                      background: 'rgba(10, 14, 26, 0.85)',
                      backdropFilter: 'blur(8px)',
                      color: 'var(--gold-400, #f6d063)',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      border: '1px solid rgba(201, 162, 39, 0.3)',
                    }}
                  >
                    {isAr ? partner.categoryLabelAr || partner.category : partner.categoryLabelEn || partner.category}
                  </div>

                  {/* Rating */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: isAr ? '14px' : 'auto',
                      left: isAr ? 'auto' : '14px',
                      background: 'rgba(0, 0, 0, 0.75)',
                      padding: '3px 10px',
                      borderRadius: '15px',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      color: '#fbbf24',
                    }}
                  >
                    ⭐ {partner.rating || 5.0}
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>
                    📍 {isAr ? partner.cityLabelAr || partner.city : partner.cityLabelEn || partner.city}
                  </div>

                  <h3
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: '800',
                      color: '#ffffff',
                      marginBottom: '0.75rem',
                      lineHeight: 1.3,
                    }}
                  >
                    {isAr ? partner.nameAr : partner.nameEn}
                  </h3>

                  <p
                    style={{
                      fontSize: '0.88rem',
                      color: 'rgba(255, 255, 255, 0.7)',
                      lineHeight: 1.6,
                      marginBottom: '1.2rem',
                      flex: 1,
                    }}
                  >
                    {isAr ? partner.descriptionAr : partner.descriptionEn}
                  </p>

                  {/* Exclusive Offer */}
                  {partner.discountOffer && (
                    <div
                      style={{
                        padding: '8px 12px',
                        background: 'rgba(201, 162, 39, 0.1)',
                        border: '1px dashed rgba(201, 162, 39, 0.4)',
                        borderRadius: '10px',
                        color: 'var(--gold-400, #f6d063)',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        marginBottom: '1.2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>🎁</span>
                      <span>{partner.discountOffer}</span>
                    </div>
                  )}

                  {/* Actions (Website & Location) */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 'auto' }}>
                    {partner.websiteUrl ? (
                      <a
                        href={partner.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          flex: 1,
                          minWidth: '120px',
                          padding: '10px 14px',
                          textAlign: 'center',
                          background: 'linear-gradient(135deg, var(--gold-500, #c9a227) 0%, var(--gold-600, #a3821a) 100%)',
                          color: '#000000',
                          fontWeight: '800',
                          fontSize: '0.85rem',
                          borderRadius: '10px',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 12px rgba(201, 162, 39, 0.25)',
                          transition: 'opacity 0.2s, transform 0.2s',
                        }}
                      >
                        <span>🌐</span>
                        <span>{isAr ? 'زيارة الموقع' : 'Visit Website'}</span>
                      </a>
                    ) : null}

                    {partner.locationUrl ? (
                      <a
                        href={partner.locationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          flex: partner.websiteUrl ? '0 0 auto' : 1,
                          minWidth: partner.websiteUrl ? 'auto' : '120px',
                          padding: '10px 14px',
                          textAlign: 'center',
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid rgba(201, 162, 39, 0.4)',
                          color: 'var(--gold-400, #f6d063)',
                          fontWeight: '700',
                          fontSize: '0.85rem',
                          borderRadius: '10px',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'background 0.2s',
                        }}
                        title={isAr ? 'الموقع على الخريطة' : 'View Location on Map'}
                      >
                        <span>📍</span>
                        <span>{isAr ? 'الموقع' : 'Location'}</span>
                      </a>
                    ) : null}

                    {!partner.websiteUrl && !partner.locationUrl && (
                      <div
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          textAlign: 'center',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontSize: '0.8rem',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        <span>⭐</span>
                        <span>{isAr ? 'شريك حصري معتمد' : 'Verified Partner'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
