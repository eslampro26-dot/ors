'use client';

import { useState, useEffect, use } from 'react';
import { cities, getLocalizedCity, getCategoryName, getTripTiers } from '@/lib/data';
import { getTrips } from '@/lib/db';
import Link from 'next/link';
import Navbar from '@/components/navigation/Navbar';
import { notFound } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

export default function CategoryPage({ params }) {
  const resolvedParams = use(params);
  const { slug, category } = resolvedParams;
  const { locale, t, isReady } = useLanguage();
  
  const city = cities.find(c => c.slug === slug);
  if (!city) notFound();
  
  const catInfo = city.categories.find(c => c.id === category);
  if (!catInfo) notFound();

  const [trips, setTrips] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [activeVideoUrl, setActiveVideoUrl] = useState(null);
  
  // State to track selected tier id for each trip
  // Format: { [tripId]: 'economy' | 'business' | 'vip' }
  const [selectedTiers, setSelectedTiers] = useState({});
  
  useEffect(() => {
    const loadTrips = async () => {
      try {
        const data = await getTrips(slug, category);
        setTrips(data || []);
        
        // Initialize all trips to economy tier
        const initialTiers = {};
        (data || []).forEach(trip => {
          initialTiers[trip.id] = 'economy';
        });
        setSelectedTiers(initialTiers);
      } catch (err) {
        console.error('Error loading category trips:', err);
      }
    };
    loadTrips();
  }, [slug, category]);

  const handleTierSelect = (tripId, tierId) => {
    setSelectedTiers(prev => ({
      ...prev,
      [tripId]: tierId
    }));
  };

  const locCity = getLocalizedCity(city, locale);
  const localizedCategoryName = getCategoryName(category, locale);

  if (!isReady) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading...</div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', paddingBottom: '4rem', background: 'transparent' }}>
      <Navbar />
      
      {/* Category Hero */}
      <div style={{
        paddingTop: 'calc(var(--nav-height) + 4rem)',
        paddingBottom: '3rem',
        background: 'linear-gradient(to right, rgba(15, 23, 42, 0.02), rgba(251, 191, 36, 0.02))',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div className="container animate-fade-in-up" style={{ textAlign: locale === 'ar' ? 'right' : 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem', fontSize: '0.9rem', flexDirection: locale === 'ar' ? 'row-reverse' : 'row' }}>
            <Link href={`/city/${city.slug}`} style={{ color: 'var(--gold-600)', fontWeight: 'bold' }}>{locCity.name}</Link>
            <span style={{ color: 'var(--text-tertiary)' }}>/</span>
            <span style={{ color: 'var(--text-secondary)' }}>{localizedCategoryName}</span>
          </div>
          
          <div>
            <h1 className="section-title" style={{ margin: 0, textAlign: locale === 'ar' ? 'right' : 'left', fontSize: '2.5rem' }}>{localizedCategoryName}</h1>
            <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-en)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
              Explore premium {localizedCategoryName} in {locCity.name}
            </p>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexDirection: locale === 'ar' ? 'row-reverse' : 'row' }}>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '800' }}>{t('common.availableOffers')}</h2>
          <span className="badge badge-ocean">{t('common.activeSlots', { active: trips.length })}</span>
        </div>

        {trips.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 'var(--space-xl)'
          }}>
            {trips.map((trip, idx) => {
              const currentTierId = selectedTiers[trip.id] || 'economy';
              const tiers = getTripTiers(trip);
              const activeTier = tiers.find(t => t.id === currentTierId) || tiers[0];
              
              return (
                <div key={trip.id} className="glass-card stagger-children" style={{ padding: 0, overflow: 'hidden', animationDelay: `${idx * 0.1}s`, display: 'flex', flexDirection: 'column' }}>
                  {/* Circular Trip Card Image */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingTop: '2rem',
                    position: 'relative'
                  }}>
                    <div style={{
                      width: '150px',
                      height: '150px',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: '4px solid var(--gold-500)',
                      boxShadow: 'var(--shadow-glow-gold), 0 8px 16px rgba(0,0,0,0.3)',
                      backgroundImage: `url(${trip.image || '/images/default.jpg'})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      backgroundColor: 'var(--bg-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}>
                      {!trip.image && <span style={{ fontSize: '0.9rem', opacity: 0.3, letterSpacing: '1px', fontWeight: 'bold', color: 'var(--text-tertiary)' }}>ORLUXUS</span>}
                      
                      {trip.videoUrl && (
                        <div 
                          onClick={() => setActiveVideoUrl(trip.videoUrl)}
                          style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(0,0,0,0.3)',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                          }}
                        >
                          <span style={{ fontSize: '2.2rem', color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.5)', userSelect: 'none' }}>▶️</span>
                        </div>
                      )}
                    </div>
                    
                    {trip.id.toString().startsWith('custom') && (
                      <span className="badge badge-gold" style={{ position: 'absolute', top: '15px', right: '15px', transform: 'scale(0.85)' }}>
                        {t('common.newBadge')}
                      </span>
                    )}
                  </div>
                  
                  {/* Trip Card Content */}
                  <div style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', flex: 1, textAlign: locale === 'ar' ? 'right' : 'left' }}>
                    
                    {/* Header: Title and Pricing */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '0.5rem', flexDirection: locale === 'ar' ? 'row-reverse' : 'row' }}>
                      <div style={{ textAlign: locale === 'ar' ? 'right' : 'left' }}>
                        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: '700', marginBottom: '4px' }}>
                          {locale === 'ar' ? trip.titleAr : (trip.titleEn || trip.titleAr)}
                        </h3>
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>{locale === 'ar' ? (trip.titleEn || '') : trip.titleAr}</span>
                      </div>
                      <div style={{ fontFamily: 'var(--font-en)', fontWeight: '800', color: 'var(--gold-600)', fontSize: '1.35rem', whiteSpace: 'nowrap', textShadow: '0 0 1px rgba(217, 119, 6, 0.1)' }}>
                        {trip.currency || '€'}{activeTier.price}
                      </div>
                    </div>

                    {/* Tier Switcher Buttons */}
                    <div style={{
                      display: 'flex',
                      background: 'var(--bg-tertiary)',
                      padding: '4px',
                      borderRadius: '12px',
                      gap: '4px',
                      marginBottom: '1rem',
                      direction: 'ltr' // Always keep tiers ltr left-to-right visually
                    }}>
                      {tiers.map(tier => {
                        const isSelected = tier.id === currentTierId;
                        let badgeColor = 'rgba(205, 127, 50, 0.15)';
                        let textColor = '#cd7f32';
                        
                        if (tier.id === 'business') {
                          badgeColor = 'rgba(149, 165, 166, 0.15)';
                          textColor = '#7f8c8d';
                        } else if (tier.id === 'vip') {
                          badgeColor = 'rgba(243, 156, 18, 0.15)';
                          textColor = '#f39c12';
                        }

                        return (
                          <button
                            key={tier.id}
                            type="button"
                            onClick={() => handleTierSelect(trip.id, tier.id)}
                            style={{
                              flex: 1,
                              padding: '6px 4px',
                              borderRadius: '8px',
                              fontSize: '0.72rem',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '2px',
                              transition: 'all 0.2s ease',
                              background: isSelected ? badgeColor : 'transparent',
                              color: isSelected ? textColor : 'var(--text-tertiary)',
                              border: isSelected ? `1px solid ${textColor}40` : '1px solid transparent',
                              boxShadow: isSelected ? 'var(--shadow-sm)' : 'none'
                            }}
                          >
                            <span>{tier.names[locale] || tier.names.en}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div style={{
                      marginBottom: '1rem',
                      background: 'rgba(255,255,255,0.02)',
                      padding: '8px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      textAlign: locale === 'ar' ? 'right' : 'left'
                    }}>
                      <p style={{
                        fontSize: '0.82rem',
                        color: 'var(--text-secondary)',
                        lineHeight: '1.4',
                        minHeight: '40px',
                        margin: 0
                      }}>
                        {activeTier.descriptions[locale] || activeTier.descriptions.en}
                      </p>
                      
                      {activeTier.richDesc && (
                        <button 
                          onClick={() => {
                            setModalContent(activeTier.richDesc);
                            setShowModal(true);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--gold-500)',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            marginTop: '0.5rem',
                            cursor: 'pointer',
                            padding: 0,
                            textDecoration: 'underline'
                          }}
                        >
                          {locale === 'ar' ? 'عرض المزيد عن هذه الفئة' : 'Show More Details'}
                        </button>
                      )}
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: '1.5rem', marginTop: 'auto', flexDirection: locale === 'ar' ? 'row-reverse' : 'row' }}>
                      <span>⏱️ {trip.duration}</span>
                      <span>⭐ {trip.rating || '5.0'} ({trip.reviews || '1'})</span>
                    </div>

                    {trip.locationUrl && (
                      <a 
                        href={trip.locationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                        style={{ 
                          width: '100%', 
                          display: 'inline-flex', 
                          justifyContent: 'center', 
                          alignItems: 'center', 
                          gap: '0.4rem', 
                          marginBottom: '0.6rem',
                          borderColor: 'var(--gold-500)',
                          color: 'var(--gold-400)'
                        }}
                      >
                        📍 {locale === 'ar' ? 'الموقع على الخريطة' : 'Location on Map'}
                      </a>
                    )}
                    
                    <Link 
                      href={`/checkout?tripId=${trip.id}&price=${activeTier.price}&titleAr=${encodeURIComponent(trip.titleAr + ' - ' + activeTier.names.ar)}&titleEn=${encodeURIComponent((trip.titleEn || trip.titleAr) + ' - ' + activeTier.names.en)}&type=trip&city=${encodeURIComponent(city.nameAr)}`} 
                      className="btn btn-primary" 
                      style={{ width: '100%', display: 'inline-flex', justifyContent: 'center' }}
                    >
                      {t('common.bookNow')}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* Rich Description Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="glass-card animate-scale-in" style={{
            background: 'var(--bg-primary)',
            padding: '2rem',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            border: '1px solid var(--gold-500)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
            <h3 style={{ color: 'var(--gold-500)', marginBottom: '1.5rem', marginTop: 0, textAlign: locale === 'ar' ? 'right' : 'left' }}>
              {locale === 'ar' ? 'تفاصيل فئة الرحلة' : 'Tier Details'}
            </h3>
            <div style={{ 
              color: 'var(--text-primary)', 
              lineHeight: '1.8', 
              fontSize: '0.95rem',
              textAlign: locale === 'ar' ? 'right' : 'left',
              whiteSpace: 'pre-wrap'
            }}>
              {modalContent}
            </div>
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <button className="btn btn-primary" onClick={() => setShowModal(false)}>
                {locale === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {activeVideoUrl && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.9)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '800px',
            aspectRatio: '16/9',
            background: '#000',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '2px solid var(--gold-500)'
          }}>
            <button 
              onClick={() => setActiveVideoUrl(null)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(0,0,0,0.6)',
                border: 'none',
                color: '#fff',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                fontSize: '1.25rem',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              ×
            </button>
            {(() => {
              const embedUrl = (() => {
                const url = activeVideoUrl;
                if (url.includes('youtube.com') || url.includes('youtu.be')) {
                  let regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                  let match = url.match(regExp);
                  if (match && match[2].length === 11) {
                    return `https://www.youtube.com/embed/${match[2]}?autoplay=1`;
                  }
                }
                return null;
              })();

              if (embedUrl) {
                return (
                  <iframe 
                    src={embedUrl}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                );
              } else {
                return (
                  <video 
                    src={activeVideoUrl}
                    controls
                    autoPlay
                    style={{ width: '100%', height: '100%' }}
                  />
                );
              }
            })()}
          </div>
        </div>
      )}
    </main>
  );
}
