'use client';

import { useState, useEffect, use } from 'react';
import { cities, getLocalizedCity, getCategoryName, getTripTiers, translateDuration } from '@/lib/data';
import { getTrips } from '@/lib/db';
import Link from 'next/link';
import Navbar from '@/components/navigation/Navbar';
import { notFound } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

import TranslatedText from '@/components/TranslatedText';
import TranslatedTextWithFallback from '@/components/TranslatedTextWithFallback';

export default function CategoryPage({ params }) {
  const resolvedParams = use(params);
  const { slug, category } = resolvedParams;
  const { locale, t, isReady } = useLanguage();
  
  const city = cities.find(c => c.slug === slug);
  if (!city) notFound();
  
  const catInfo = city.categories.find(c => c.id === category);
  if (!catInfo) notFound();

  const [trips, setTrips] = useState([]);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', richDesc: '', images: [] });
  const [activeVideoUrl, setActiveVideoUrl] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // Per-card image carousel index: { [tripId]: number }
  const [cardImageIndexes, setCardImageIndexes] = useState({});
  
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

  const handleCardImageNext = (tripId, imagesArr) => {
    setCardImageIndexes(prev => ({ ...prev, [tripId]: ((prev[tripId] || 0) + 1) % imagesArr.length }));
  };

  const handleCardImagePrev = (tripId, imagesArr) => {
    setCardImageIndexes(prev => ({ ...prev, [tripId]: ((prev[tripId] || 0) - 1 + imagesArr.length) % imagesArr.length }));
  };

  const handleNextImage = () => {
    if (modalConfig.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % modalConfig.images.length);
    }
  };

  const handlePrevImage = () => {
    if (modalConfig.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + modalConfig.images.length) % modalConfig.images.length);
    }
  };

  const handleImageDotClick = (index) => {
    setCurrentImageIndex(index);
  };

  // Reset image index when modal opens
  useEffect(() => {
    if (modalConfig.isOpen) {
      setCurrentImageIndex(0);
    }
  }, [modalConfig.isOpen]);

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
              {t('common.explorePremium').replace('{category}', localizedCategoryName).replace('{city}', locCity.name)}
            </p>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexDirection: locale === 'ar' ? 'row-reverse' : 'row' }}>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '800' }}>{t('common.availableOffers')}</h2>
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
                  {/* Full-width Trip Card Banner Image */}
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '200px',
                    overflow: 'hidden',
                    borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
                    flexShrink: 0
                  }}>
                    <div style={{
                      width: '100%',
                      height: '100%',
                      backgroundImage: `url(${trip.image || '/images/trips/glass-boat.jpg'})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      backgroundColor: 'var(--bg-tertiary)',
                      transition: 'transform 0.4s ease',
                    }} />
                    {/* Gradient overlay at bottom */}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)' }} />

                    {/* Video play button overlay */}
                    {trip.videoUrl && (
                      <div
                        onClick={() => setActiveVideoUrl(trip.videoUrl)}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.5)' }}>
                          <span style={{ fontSize: '1.4rem', color: '#fff', userSelect: 'none', paddingLeft: '3px' }}>&#9654;</span>
                        </div>
                      </div>
                    )}

                    {/* NEW badge */}
                    {trip.id.toString().startsWith('custom') && (
                      <span className="badge badge-gold" style={{ position: 'absolute', top: '12px', right: locale === 'ar' ? 'auto' : '12px', left: locale === 'ar' ? '12px' : 'auto', transform: 'scale(0.9)' }}>
                        {t('common.newBadge')}
                      </span>
                    )}

                    {/* Multiple images indicator + click to browse */}
                    {(() => {
                      const cardImages = trip.images && trip.images.length > 0 ? [trip.image || '', ...trip.images] : null;
                      const cardIdx = cardImageIndexes[trip.id] || 0;
                      return cardImages ? (
                        <>
                          {/* Show current card image */}
                          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${cardImages[cardIdx] || cardImages[0]})`, backgroundSize: 'cover', backgroundPosition: 'center', transition: 'background-image 0.3s ease' }} />
                          {/* Prev/Next arrows */}
                          <button
                            onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleCardImagePrev(trip.id, cardImages); }}
                            style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}
                          >‹</button>
                          <button
                            onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleCardImageNext(trip.id, cardImages); }}
                            style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}
                          >›</button>
                          {/* Dots */}
                          <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '4px', zIndex: 5 }}>
                            {cardImages.map((_, i) => (
                              <span key={i} onClick={(e) => { e.preventDefault(); setCardImageIndexes(prev => ({ ...prev, [trip.id]: i })); }} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i === cardIdx ? '#fff' : 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'block' }} />
                            ))}
                          </div>
                        </>
                      ) : null;
                    })()}
                  </div>
                  
                  {/* Trip Card Content */}
                  <div style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', flex: 1, textAlign: locale === 'ar' ? 'right' : 'left' }}>
                    
                    {/* Header: Title and Pricing */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '0.5rem', flexDirection: locale === 'ar' ? 'row-reverse' : 'row' }}>
                      <div style={{ textAlign: locale === 'ar' ? 'right' : 'left' }}>
                        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: '700', marginBottom: '4px' }}>
                          <TranslatedTextWithFallback trip={trip} locale={locale} />
                        </h3>
                      </div>
                      <div style={{ fontFamily: 'var(--font-en)', fontWeight: '800', color: 'var(--gold-600)', fontSize: '1.35rem', whiteSpace: 'nowrap', textShadow: '0 0 1px rgba(217, 119, 6, 0.1)' }}>
                        {trip.currency || '€'}{activeTier.price}
                      </div>
                    </div>

                    {/* Tier Switcher Buttons (rendered ONLY if multiple tiers are enabled) */}
                    {tiers.length > 1 && (
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
                              <span>{tier.names[locale?.toLowerCase()] || tier.names[locale] || tier.names.en}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

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
                        {activeTier.descriptions[locale?.toLowerCase()] || activeTier.descriptions[locale] || activeTier.descriptions.en}
                      </p>
                      
                      {activeTier.richDesc && (
                        <button 
                          onClick={() => {
                            setModalConfig({
                              isOpen: true,
                              title: locale === 'ar' 
                                ? (trip.titleAr + ' - ' + activeTier.names.ar) 
                                : ((trip.titleEn || trip.titleAr) + ' - ' + activeTier.names.en),
                              richDesc: activeTier.richDesc,
                              images: trip.images && trip.images.length > 0 ? trip.images : [trip.image || '/images/trips/glass-boat.jpg']
                            });
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
                          {t('common.showMoreDetails')}
                        </button>
                      )}
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: '1.5rem', marginTop: 'auto', flexDirection: locale === 'ar' ? 'row-reverse' : 'row' }}>
                      <span>⏱️ {translateDuration(trip, locale)}</span>
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
                        📍 {t('common.locationOnMap')}
                      </a>
                    )}
                    
                    <Link 
                      href={`/checkout?tripId=${trip.id}&price=${activeTier.price}&titleAr=${encodeURIComponent(trip.titleAr + ' - ' + activeTier.names.ar)}&titleEn=${encodeURIComponent((trip.titleEn || trip.titleAr) + ' - ' + activeTier.names.en)}&type=trip&city=${encodeURIComponent(city.nameAr)}&category=${category}&tier=${activeTier.id}`} 
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
      {modalConfig.isOpen && (
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
              onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '1.5rem',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              ×
            </button>
            <h3 style={{ color: 'var(--gold-500)', marginBottom: '1.5rem', marginTop: 0, paddingRight: '20px', textAlign: locale === 'ar' ? 'right' : 'left' }}>
              {modalConfig.title}
            </h3>

            {/* Gallery Images - Professional Slider */}
            {modalConfig.images && modalConfig.images.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ 
                  position: 'relative',
                  width: '100%',
                  height: '400px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: '#000'
                }}>
                  {/* Main Image */}
                  <img 
                    src={modalConfig.images[currentImageIndex]} 
                    alt={`Gallery ${currentImageIndex + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      transition: 'opacity 0.3s ease'
                    }}
                  />

                  {/* Navigation Arrows */}
                  {modalConfig.images.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '16px',
                          transform: 'translateY(-50%)',
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          background: 'rgba(255, 255, 255, 0.9)',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px',
                          color: '#000',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                          transition: 'all 0.2s ease',
                          zIndex: 10
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#fff'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'}
                      >
                        {locale === 'ar' ? '›' : '‹'}
                      </button>
                      <button
                        onClick={handleNextImage}
                        style={{
                          position: 'absolute',
                          top: '50%',
                          right: '16px',
                          transform: 'translateY(-50%)',
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          background: 'rgba(255, 255, 255, 0.9)',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px',
                          color: '#000',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                          transition: 'all 0.2s ease',
                          zIndex: 10
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#fff'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'}
                      >
                        {locale === 'ar' ? '‹' : '›'}
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: locale === 'ar' ? 'auto' : '16px',
                    left: locale === 'ar' ? '16px' : 'auto',
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: '#fff',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    backdropFilter: 'blur(4px)'
                  }}>
                    {currentImageIndex + 1} / {modalConfig.images.length}
                  </div>
                </div>

                {/* Dots Navigation */}
                {modalConfig.images.length > 1 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '1rem'
                  }}>
                    {modalConfig.images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleImageDotClick(idx)}
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: idx === currentImageIndex ? '#C9A227' : 'rgba(0, 0, 0, 0.3)',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (idx !== currentImageIndex) {
                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (idx !== currentImageIndex) {
                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)';
                          }
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            <div style={{ 
              color: 'var(--text-primary)', 
              lineHeight: '1.8', 
              fontSize: '0.95rem',
              textAlign: locale === 'ar' ? 'right' : 'left',
              whiteSpace: 'pre-wrap'
            }}>
              <TranslatedText text={modalConfig.richDesc} />
            </div>
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <button className="btn btn-primary" onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}>
                {t('common.close') || (locale === 'ar' ? 'إغلاق' : 'Close')}
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
                const url = activeVideoUrl.trim();
                
                // Handle YouTube URLs
                if (url.includes('youtube.com') || url.includes('youtu.be')) {
                  let videoId = '';
                  
                  // Extract video ID from various YouTube URL formats
                  if (url.includes('youtu.be/')) {
                    videoId = url.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0];
                  } else if (url.includes('youtube.com/watch')) {
                    const urlParams = new URLSearchParams(url.split('?')[1]);
                    videoId = urlParams.get('v');
                  } else if (url.includes('youtube.com/embed/')) {
                    videoId = url.split('youtube.com/embed/')[1]?.split('?')[0]?.split('&')[0];
                  } else if (url.includes('youtube.com/v/')) {
                    videoId = url.split('youtube.com/v/')[1]?.split('?')[0]?.split('&')[0];
                  } else if (url.includes('youtube.com/shorts/')) {
                    videoId = url.split('youtube.com/shorts/')[1]?.split('?')[0]?.split('&')[0];
                  }
                  
                  if (videoId && videoId.length >= 11) {
                    return `https://www.youtube.com/embed/${videoId.substring(0, 11)}?autoplay=1&rel=0&modestbranding=1`;
                  }
                }
                
                // Handle Vimeo URLs
                if (url.includes('vimeo.com')) {
                  const vimeoId = url.match(/vimeo\.com\/(\d+)/);
                  if (vimeoId && vimeoId[1]) {
                    return `https://player.vimeo.com/video/${vimeoId[1]}?autoplay=1`;
                  }
                }
                
                return null;
              })();

              if (embedUrl) {
                return (
                  <iframe 
                    src={embedUrl}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                    title="Video Player"
                  />
                );
              } else {
                return (
                  <video 
                    src={activeVideoUrl}
                    controls
                    autoPlay
                    style={{ width: '100%', height: '100%' }}
                  >
                    Your browser does not support the video tag.
                  </video>
                );
              }
            })()}
          </div>
        </div>
      )}
    </main>
  );
}
