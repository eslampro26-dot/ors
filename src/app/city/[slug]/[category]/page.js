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
import ServiceReviews from '@/components/ServiceReviews';

// Live translation component for trip descriptions
function LiveTranslatedDesc({ trip, locale }) {
  const capLocale = locale ? locale.charAt(0).toUpperCase() + locale.slice(1) : 'En';
  const storedTranslation = trip[`tripDescription${capLocale}`]
    || (locale === 'en' ? (trip.tripDescriptionEn || trip.tripDescription || '') : null);

  const sourceText = trip.tripDescriptionEn || trip.tripDescription || trip.tripDescriptionAr || '';
  const [text, setText] = useState(storedTranslation || sourceText || '');

  useEffect(() => {
    const stored = trip[`tripDescription${capLocale}`];
    if (stored && stored !== sourceText) {
      setText(stored);
      return;
    }
    if (!sourceText || locale === 'en') {
      setText(sourceText || '');
      return;
    }
    // Need to translate live
    let alive = true;
    fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: sourceText, to: locale })
    })
      .then(r => r.ok ? r.json() : {})
      .then(data => {
        if (alive && data?.translatedText) setText(data.translatedText);
        else if (alive) setText(sourceText);
      })
      .catch(() => { if (alive) setText(sourceText); });
    return () => { alive = false; };
  }, [trip.id, locale, sourceText, storedTranslation]);

  if (!text) return null;
  return <span style={{ whiteSpace: 'pre-wrap' }}>{text}</span>;
}

// Live translation for trip title
function LiveTranslatedTitle({ trip, locale, style }) {
  const capLocale = locale ? locale.charAt(0).toUpperCase() + locale.slice(1) : 'En';
  const stored = trip[`title${capLocale}`];
  const sourceText = trip.titleEn || trip.titleAr || '';
  const [title, setTitle] = useState(stored || sourceText || '');

  useEffect(() => {
    const s = trip[`title${capLocale}`];
    if (s && s !== sourceText) { setTitle(s); return; }
    if (!sourceText || locale === 'en') { setTitle(sourceText); return; }
    let alive = true;
    fetch('/api/auto-translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: sourceText, sourceLang: 'en', targetLangs: [locale] })
    })
      .then(r => r.ok ? r.json() : {})
      .then(data => {
        if (alive && data?.translations?.[locale]) setTitle(data.translations[locale]);
        else if (alive) setTitle(sourceText);
      })
      .catch(() => { if (alive) setTitle(sourceText); });
    return () => { alive = false; };
  }, [trip.id, locale, sourceText]);

  return <h2 style={style}>{title || sourceText}</h2>;
}

export default function CategoryPage({ params }) {
  const resolvedParams = use(params);
  const { slug, category } = resolvedParams;
  const { locale, t, isReady } = useLanguage();
  
  const city = cities.find(c => c.slug === slug);
  if (!city) notFound();
  
  const catInfo = city.categories.find(c => c.id === category);
  if (!catInfo) notFound();

  const [trips, setTrips] = useState([]);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, trip: null, tier: null, images: [], videos: [] });
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
                    height: '260px',
                    overflow: 'hidden',
                    borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
                    flexShrink: 0
                  }}>
                    {/* Blurred background cover */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage: `url(${trip.image || '/images/trips/glass-boat.jpg'})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center center',
                      backgroundRepeat: 'no-repeat',
                      filter: 'blur(8px)',
                      opacity: 0.5
                    }} />
                    {/* Contained full image foreground */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage: `url(${trip.image || '/images/trips/glass-boat.jpg'})`,
                      backgroundSize: 'contain',
                      backgroundPosition: 'center center',
                      backgroundRepeat: 'no-repeat',
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



                    {/* Multiple images indicator + touch swipe support */}
                    {(() => {
                      const cardImages = trip.images && trip.images.length > 0 ? [trip.image || '', ...trip.images] : null;
                      const cardIdx = cardImageIndexes[trip.id] || 0;
                      if (!cardImages || cardImages.length <= 1) return null;

                      return (
                        <div 
                          onTouchStart={(e) => {
                            e.currentTarget.dataset.touchX = e.changedTouches[0].clientX;
                          }}
                          onTouchEnd={(e) => {
                            const startX = parseFloat(e.currentTarget.dataset.touchX || '0');
                            const endX = e.changedTouches[0].clientX;
                            const diff = startX - endX;
                            if (Math.abs(diff) > 30) {
                              if (diff > 0) {
                                handleCardImageNext(trip.id, cardImages);
                              } else {
                                handleCardImagePrev(trip.id, cardImages);
                              }
                            }
                          }}
                          style={{ position: 'absolute', inset: 0, cursor: 'grab', userSelect: 'none', touchAction: 'pan-y' }}
                          title={locale === 'ar' ? 'اسحب ليمين أو اليسار للتنقل بين الصور' : 'Swipe left or right to view photos'}
                        >
                          {/* Show current card image with smooth fade */}
                          {/* Blurred background cover */}
                          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${cardImages[cardIdx] || cardImages[0]})`, backgroundSize: 'cover', backgroundPosition: 'center center', filter: 'blur(8px)', opacity: 0.5 }} />
                          {/* Contained full image foreground */}
                          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${cardImages[cardIdx] || cardImages[0]})`, backgroundSize: 'contain', backgroundPosition: 'center center', backgroundRepeat: 'no-repeat', transition: 'background-image 0.3s ease' }} />
                          
                          {/* Photo Counter Badge */}
                          <div style={{ position: 'absolute', top: '12px', left: locale === 'ar' ? 'auto' : '12px', right: locale === 'ar' ? '12px' : 'auto', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', color: '#fff', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', zIndex: 5 }}>
                            📷 {cardIdx + 1}/{cardImages.length}
                          </div>

                          {/* Touch swipeable image layer without prominent side arrows */}
                          {/* Dot indicators below provide visual page context */}

                          {/* Dots */}
                          <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '5px', zIndex: 5 }}>
                            {cardImages.map((_, i) => (
                              <span 
                                key={i} 
                                onClick={(e) => { e.stopPropagation(); e.preventDefault(); setCardImageIndexes(prev => ({ ...prev, [trip.id]: i })); }} 
                                style={{ width: '8px', height: '8px', borderRadius: '50%', background: i === cardIdx ? 'var(--gold-400)' : 'rgba(255,255,255,0.6)', transition: 'all 0.2s ease', cursor: 'pointer', display: 'block', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }} 
                              />
                            ))}
                          </div>
                        </div>
                      );
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


                    {/* View Full Details button */}
                    <div style={{ marginBottom: '1rem' }}>
                      <button 
                        onClick={() => {
                          setCurrentImageIndex(0);
                          setModalConfig({
                            isOpen: true,
                            trip,
                            tier: activeTier,
                            images: trip.images && trip.images.length > 0 ? trip.images : (trip.image ? [trip.image] : ['/images/trips/glass-boat.jpg']),
                            videos: trip.videos && trip.videos.length > 0 ? trip.videos : (trip.videoUrl ? [trip.videoUrl] : [])
                          });
                        }}
                        style={{
                          background: 'rgba(201,162,39,0.08)',
                          border: '1px solid rgba(201,162,39,0.4)',
                          color: 'var(--gold-400)',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          padding: '7px 14px',
                          borderRadius: '8px',
                          width: '100%',
                          transition: 'all 0.2s ease',
                          letterSpacing: '0.3px'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,162,39,0.18)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(201,162,39,0.08)'}
                      >
                        🔍 {locale === 'ar' ? 'عرض التفاصيل الكاملة' : 'View Full Details'}
                      </button>
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
                      href={`/checkout?tripId=${trip.id}&price=${activeTier.price}&titleAr=${encodeURIComponent(tiers.length > 1 ? (trip.titleAr + ' - ' + activeTier.names.ar) : trip.titleAr)}&titleEn=${encodeURIComponent(tiers.length > 1 ? ((trip.titleEn || trip.titleAr) + ' - ' + activeTier.names.en) : (trip.titleEn || trip.titleAr))}&type=trip&city=${encodeURIComponent(city.nameAr)}&category=${category}&tier=${activeTier.id}&tierDesc=${encodeURIComponent(activeTier.descriptions[locale] || activeTier.descriptions.en || activeTier.descriptions.ar || '')}&childPrice=${activeTier.childPrice ?? trip.childPrice ?? 0}&infantPrice=${activeTier.infantPrice ?? trip.infantPrice ?? 0}&additionalPersonPrice=${trip.additionalPersonPrice || 0}&allowedRequests=${encodeURIComponent(JSON.stringify(trip.specialRequests || []))}`} 
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

      {/* Full-Screen Trip Details Panel */}
      {modalConfig.isOpen && modalConfig.trip && (() => {
        // Always get fresh trip data from live trips state so locale changes work
        const mdTrip = trips.find(t => t.id === modalConfig.trip.id) || modalConfig.trip;
        const mdTier = modalConfig.tier;
        const isAr = locale === 'ar';
        const allImages = modalConfig.images;
        const allVideos = modalConfig.videos;
        const mdTiers = getTripTiers(mdTrip, locale);
        const tierLabel = mdTier ? (mdTier.names?.[locale] || mdTier.names?.en || '') : '';
        const richDesc = mdTier?.richDesc || '';

        return (
          <div
            onClick={e => { if (e.target === e.currentTarget) setModalConfig(prev => ({ ...prev, isOpen: false })); }}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.88)',
              zIndex: 99990,
              overflowY: 'auto',
              backdropFilter: 'blur(6px)',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <div style={{
              background: 'var(--bg-primary)',
              width: '100%',
              maxWidth: '900px',
              margin: '0 auto',
              minHeight: '100vh',
              direction: isAr ? 'rtl' : 'ltr',
              position: 'relative'
            }}>

              {/* Close Button */}
              <button
                onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                style={{
                  position: 'fixed',
                  top: '14px',
                  right: isAr ? 'auto' : '14px',
                  left: isAr ? '14px' : 'auto',
                  background: 'rgba(0,0,0,0.75)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  color: '#fff',
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  fontSize: '1.4rem',
                  cursor: 'pointer',
                  zIndex: 99999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.9)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.75)'}
              >×</button>

              {/* Hero Image Gallery */}
              <div style={{ position: 'relative', width: '100%', height: 'min(55vw, 460px)', background: '#111', overflow: 'hidden' }}>
                {allImages.length > 0 && (
                  <img
                    src={allImages[currentImageIndex]}
                    alt={tripTitle}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.35s ease' }}
                  />
                )}
                {/* Bottom gradient */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%', background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)', pointerEvents: 'none' }} />

                {/* Navigation arrows */}
                {allImages.length > 1 && (
                  <>
                    <button onClick={handlePrevImage} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.88)', border: 'none', borderRadius: '50%', width: '44px', height: '44px', fontSize: '1.3rem', cursor: 'pointer', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.3)', transition: 'background 0.2s' }}>‹</button>
                    <button onClick={handleNextImage} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.88)', border: 'none', borderRadius: '50%', width: '44px', height: '44px', fontSize: '1.3rem', cursor: 'pointer', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.3)', transition: 'background 0.2s' }}>›</button>
                  </>
                )}

                {/* Image counter badge */}
                {allImages.length > 1 && (
                  <div style={{ position: 'absolute', top: '14px', left: isAr ? '14px' : 'auto', right: isAr ? 'auto' : '14px', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '600', fontFamily: 'var(--font-en)' }}>
                    📷 {currentImageIndex + 1} / {allImages.length}
                  </div>
                )}

                {/* Dot indicators */}
                {allImages.length > 1 && allImages.length <= 12 && (
                  <div style={{ position: 'absolute', bottom: '14px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px', zIndex: 5 }}>
                    {allImages.map((_, i) => (
                      <button key={i} onClick={() => setCurrentImageIndex(i)} style={{ width: i === currentImageIndex ? '22px' : '8px', height: '8px', borderRadius: '4px', background: i === currentImageIndex ? 'var(--gold-400)' : 'rgba(255,255,255,0.55)', border: 'none', cursor: 'pointer', transition: 'all 0.25s ease', padding: 0, flexShrink: 0 }} />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnail strip (when 4+ images) */}
              {allImages.length >= 4 && (
                <div style={{ display: 'flex', gap: '5px', padding: '8px 12px', overflowX: 'auto', background: '#0a0a0a', borderBottom: '1px solid var(--border-subtle)' }}>
                  {allImages.map((img, i) => (
                    <img key={i} src={img} alt="" onClick={() => setCurrentImageIndex(i)} style={{ width: '60px', height: '46px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer', flexShrink: 0, border: i === currentImageIndex ? '2px solid var(--gold-400)' : '2px solid transparent', opacity: i === currentImageIndex ? 1 : 0.65, transition: 'all 0.2s' }} />
                  ))}
                </div>
              )}

              {/* Content Area */}
              <div style={{ padding: 'clamp(1.2rem, 4vw, 2.5rem)', maxWidth: '800px', margin: '0 auto' }}>

                {/* Title + Tier badge */}
                <div style={{ marginBottom: '1.25rem' }}>
                  {mdTiers.length > 1 && tierLabel && (
                    <span style={{ background: 'rgba(201,162,39,0.12)', color: 'var(--gold-400)', padding: '3px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', display: 'inline-block', marginBottom: '0.6rem', border: '1px solid rgba(201,162,39,0.3)' }}>{tierLabel}</span>
                  )}
                  <LiveTranslatedTitle trip={mdTrip} locale={locale} style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 0.75rem', lineHeight: 1.25 }} />
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <span>⏱️ {translateDuration(mdTrip, locale)}</span>
                    <span>⭐ {mdTrip.rating || '5.0'} ({mdTrip.reviews || '1'} {isAr ? 'تقييم' : 'reviews'})</span>
                    <span style={{ fontFamily: 'var(--font-en)', fontWeight: '800', color: 'var(--gold-500)', fontSize: '1.15rem', direction: 'ltr' }}>
                      {mdTrip.currency || '€'}{mdTier?.price || mdTrip.price}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {(richDesc || mdTrip.tripDescriptionEn || mdTrip.tripDescription || mdTrip.tripDescriptionAr) && (
                  <div style={{ marginBottom: '1.75rem', padding: '1.25rem', background: 'rgba(255,255,255,0.025)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                    <h4 style={{ color: 'var(--gold-400)', fontSize: '0.82rem', fontWeight: '800', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 0.75rem' }}>
                      📋 {isAr ? 'تفاصيل الرحلة' : 'Trip Details'}
                    </h4>
                    <div style={{ color: 'var(--text-secondary)', lineHeight: '1.85', fontSize: '0.95rem', textAlign: isAr ? 'right' : 'left' }}>
                      {richDesc ? richDesc : <LiveTranslatedDesc trip={mdTrip} locale={locale} />}
                    </div>
                  </div>
                )}

                {/* Embedded Videos */}
                {allVideos.length > 0 && (
                  <div style={{ marginBottom: '1.75rem' }}>
                    <h4 style={{ color: 'var(--gold-400)', fontSize: '0.82rem', fontWeight: '800', marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                      🎬 {isAr ? 'فيديوهات الرحلة' : 'Trip Videos'}
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {allVideos.map((vUrl, vi) => {
                        const url = vUrl.trim();
                        let embedUrl = null;
                        let rawVideoUrl = url;
                        if (url.includes('youtube.com') || url.includes('youtu.be')) {
                          let videoId = '';
                          if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0];
                          else if (url.includes('watch')) { try { videoId = new URLSearchParams(url.split('?')[1]).get('v') || ''; } catch(e){} }
                          else if (url.includes('embed/')) videoId = url.split('embed/')[1]?.split('?')[0];
                          else if (url.includes('shorts/')) videoId = url.split('shorts/')[1]?.split('?')[0];
                          if (videoId && videoId.length >= 11) {
                            const cleanId = videoId.substring(0, 11);
                            embedUrl = `https://www.youtube-nocookie.com/embed/${cleanId}?rel=0&modestbranding=1&enablejsapi=1`;
                            rawVideoUrl = `https://www.youtube.com/watch?v=${cleanId}`;
                          }
                        } else if (url.includes('vimeo.com')) {
                          const m = url.match(/vimeo\.com\/(\d+)/);
                          if (m) embedUrl = `https://player.vimeo.com/video/${m[1]}`;
                        }
                        return (
                          <div key={vi} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: '12px', overflow: 'hidden', background: '#000', border: '1px solid var(--border-subtle)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                              {embedUrl ? (
                                <iframe
                                  src={embedUrl}
                                  style={{ width: '100%', height: '100%', border: 'none' }}
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                  allowFullScreen
                                  title={`Video ${vi + 1}`}
                                  loading="lazy"
                                />
                              ) : (
                                <video src={url} controls style={{ width: '100%', height: '100%' }} />
                              )}
                            </div>
                            {embedUrl && (
                              <a
                                href={rawVideoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem', alignSelf: 'flex-end' }}
                              >
                                ↗️ {isAr ? 'مشاهدة الفيديو على يوتيوب مباشرة' : 'Watch directly on YouTube'}
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Location link */}
                {mdTrip.locationUrl && (
                  <a href={mdTrip.locationUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    📍 {isAr ? 'الموقع على الخريطة' : 'View on Map'}
                  </a>
                )}

                {/* Book Now */}
                <a
                  href={`/checkout?tripId=${mdTrip.id}&price=${mdTier?.price || mdTrip.price}&titleAr=${encodeURIComponent(mdTiers.length > 1 ? (mdTrip.titleAr + ' - ' + (mdTier?.names?.ar || '')) : mdTrip.titleAr)}&titleEn=${encodeURIComponent(mdTiers.length > 1 ? ((mdTrip.titleEn || mdTrip.titleAr) + ' - ' + (mdTier?.names?.en || '')) : (mdTrip.titleEn || mdTrip.titleAr))}&type=trip&city=${encodeURIComponent(city.nameAr)}&category=${category}&tier=${mdTier?.id || 'economy'}&childPrice=${mdTrip.childPrice || 0}&infantPrice=${mdTrip.infantPrice || 0}&additionalPersonPrice=${mdTrip.additionalPersonPrice || 0}&allowedRequests=${encodeURIComponent(JSON.stringify(mdTrip.specialRequests || []))}`}
                  className="btn btn-primary"
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem', padding: '15px', fontSize: '1.05rem', fontWeight: '800', borderRadius: '12px', boxShadow: '0 4px 20px rgba(201,162,39,0.3)', textDecoration: 'none' }}
                >
                  🛒 {isAr ? 'احجز الآن' : 'Book Now'}
                </a>

                {/* Verified Reviews Section */}
                <ServiceReviews serviceId={mdTrip.id} locale={locale} />

                <div style={{ marginTop: '1rem', textAlign: 'center', paddingBottom: '2rem' }}>
                  <button onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '0.82rem', textDecoration: 'underline' }}>
                    {isAr ? 'إغلاق' : 'Close'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}


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
