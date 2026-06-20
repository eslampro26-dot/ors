'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/navigation/Navbar';
import OptimizedImage from '@/components/OptimizedImage';
import LazySection, { SectionSkeleton } from '@/components/LazySection';
import { cities, getLocalizedCity } from '@/lib/data';
import { getReviews, addReview, getSocialMedia } from '@/lib/db';
import { useLanguage } from '@/context/LanguageContext';
import { getMessages, messages } from '@/lib/messages';

export default function Home() {
  const [siteName, setSiteName] = useState('ORLUXUS');
  const [whatsapp, setWhatsapp] = useState('+20100000000');
  const [reviews, setReviews] = useState([]);
  const [socialMedia, setSocialMedia] = useState({});
  
  const { locale, t, isReady } = useLanguage();

  const [heroActiveIndex, setHeroActiveIndex] = useState(0);

  const HERO_IMAGES = useMemo(() => [
    'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1600&q=80', // Pyramids
    'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1600&q=80', // Hurghada
    'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1600&q=80', // Luxor
    'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1600&q=80'  // Sharm
  ], []);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroActiveIndex(prev => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [HERO_IMAGES]);

  const storyParagraphs = useMemo(() => {
    const msgs = getMessages(locale);
    return msgs.whyChooseUs?.story || messages.en.whyChooseUs.story;
  }, [locale]);

  const storyTitle = useMemo(() => {
    const msgs = getMessages(locale);
    return msgs.whyChooseUs?.storyTitle || messages.en.whyChooseUs.storyTitle;
  }, [locale]);

  // Review Form States
  const [reviewForm, setReviewForm] = useState({
    name: '',
    country: '',
    rating: 0,
    text: ''
  });
  const [hoverRating, setHoverRating] = useState(0);

  // Safely sync company details and reviews from LocalStorage after hydration
  useEffect(() => {
    const loadData = async () => {
      if (typeof window !== 'undefined') {
        const savedName = localStorage.getItem('orluxus_site_name');
        const savedPhone = localStorage.getItem('orluxus_whatsapp');
        if (savedName) setSiteName(savedName);
        if (savedPhone) setWhatsapp(savedPhone);

        try {
          // Load dynamic reviews
          const dynamicReviews = await getReviews();
          setReviews(dynamicReviews || []);

          // Load social media
          const socialData = await getSocialMedia();
          setSocialMedia(socialData || {});
        } catch (err) {
          console.error('Error loading homepage data:', err);
        }
      }
    };
    loadData();
  }, []);

  const handleSubmitReview = useCallback(async (e) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.country || !reviewForm.rating || !reviewForm.text) {
      alert(t('reviews.fillAlert'));
      return;
    }
    
    try {
      const newReview = await addReview({
        name: reviewForm.name,
        country: reviewForm.country,
        rating: reviewForm.rating,
        text: reviewForm.text
      });

      if (newReview) {
        setReviews(prev => [newReview, ...prev]);
        setReviewForm({ name: '', country: '', rating: 0, text: '' });
        alert(t('reviews.success'));
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      alert(t('reviews.error'));
    }
  }, [reviewForm, t]);

  const features = useMemo(() => [
    { icon: '👑', title: t('whyChooseUs.luxury'), desc: t('whyChooseUs.luxuryDesc') },
    { icon: '👨‍👩‍👧‍👦', title: t('whyChooseUs.family'), desc: t('whyChooseUs.familyDesc') },
    { icon: '⚡', title: t('whyChooseUs.booking'), desc: t('whyChooseUs.bookingDesc') },
    { icon: '🛡️', title: t('whyChooseUs.excursions'), desc: t('whyChooseUs.excursionsDesc') }
  ], [t]);

  const quickLinks = useMemo(() => [
    { name: t('hero.seaCruises'), href: '/city/sharm-el-sheikh/sea-trips' },
    { name: t('hero.desertSafaris'), href: '/city/sharm-el-sheikh/desert-trips' },
    { name: t('hero.historicTours'), href: '/city/sharm-el-sheikh/city-tours' },
    { name: t('hero.allInclusive'), href: '/city/dahab/packages' }
  ], [t]);

  if (!isReady) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading ORLUXUS...</div>
      </main>
    );
  }

  return (
    <main id="main-content" style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }} className="water-bg-pattern">
      <Navbar />
      
      {/* 1. HERO SECTION */}
      <section style={{
        minHeight: '95vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'var(--space-3xl) var(--space-xl) var(--space-xl) var(--space-xl)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Slideshow */}
        {HERO_IMAGES.map((img, idx) => (
          <div
            key={idx}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `linear-gradient(to bottom, rgba(10, 14, 23, 0.45), rgba(10, 14, 23, 0.75)), url(${img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: heroActiveIndex === idx ? 1 : 0,
              transition: 'opacity 1.5s ease-in-out',
              transform: heroActiveIndex === idx ? 'scale(1.05)' : 'scale(1)',
              animation: heroActiveIndex === idx ? 'kenburns 6s ease-out forwards' : 'none',
              zIndex: 1
            }}
          />
        ))}

        {/* Glow Element */}
        <div style={{
          position: 'absolute',
          bottom: '10%',
          left: '10%',
          width: '350px',
          height: '350px',
          background: 'var(--ocean-500)',
          filter: 'blur(150px)',
          opacity: 0.08,
          borderRadius: '50%',
          zIndex: 2
        }}></div>

        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div className="animate-fade-in-up">
            
            <h1 style={{ 
              fontSize: 'clamp(3.5rem, 8.5vw, 6.5rem)', 
              fontWeight: 900, 
              color: 'var(--text-primary)',
              lineHeight: 1.1,
              marginBottom: '1rem',
              letterSpacing: '4px',
              fontFamily: 'var(--font-en)',
              background: 'linear-gradient(135deg, var(--gold-300) 30%, var(--gold-500) 70%, var(--gold-600) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 4px 15px rgba(217, 119, 6, 0.4))'
            }}>
              {siteName}
            </h1>
            
            <p style={{ 
              fontSize: 'clamp(0.95rem, 2.5vw, 1.3rem)', 
              color: '#f8fafc',
              letterSpacing: '6px',
              textTransform: 'uppercase',
              fontWeight: '700',
              marginBottom: '4rem',
              fontFamily: 'var(--font-en)',
              textShadow: '0 2px 8px rgba(0,0,0,0.5)'
            }}>
              {t('hero.familySpirit')}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', alignItems: 'center', justifyContent: 'center' }}>
              <Link href="/city/sharm-el-sheikh" className="btn btn-primary" style={{ padding: '1.2rem 3.2rem', fontSize: '1.15rem', borderRadius: '50px', boxShadow: '0 8px 30px rgba(217, 119, 6, 0.5)', transition: 'all 0.3s ease', transform: 'translateY(0)' }}>
                {t('hero.start')}
              </Link>

              {/* Tagline Container */}
              <div style={{
                marginTop: '1.5rem',
                padding: '1.5rem 2.5rem',
                borderRadius: '20px',
                background: 'rgba(9, 13, 22, 0.65)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(251, 191, 36, 0.25)',
                maxWidth: '650px',
                width: '100%',
                marginInline: 'auto'
              }}>
                <p style={{
                  color: 'var(--gold-400)',
                  fontSize: '1.25rem',
                  fontWeight: '800',
                  lineHeight: '1.6',
                  margin: 0,
                  textShadow: '0 2px 10px rgba(251, 191, 36, 0.3)'
                }}>
                  {t('hero.storyQuote')}
                </p>
                <p style={{
                  color: '#e2e8f0',
                  fontSize: '0.92rem',
                  fontWeight: '600',
                  lineHeight: '1.6',
                  marginTop: '0.5rem',
                  marginBottom: 0
                }}>
                  {t('hero.storyQuoteSub')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Water Waves Transition Divider */}
      <div style={{ position: 'relative', width: '100%', overflow: 'hidden', height: '80px', marginTop: '-80px', zIndex: 11, pointerEvents: 'none' }}>
        <svg viewBox="0 0 1440 74" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
          <path className="animated-wave-1" d="M0 24C120 24 240 40 360 40C480 40 600 8 720 8C840 8 960 48 1080 48C1200 48 1320 16 1440 16V74H0V24Z" fill="var(--bg-secondary)" opacity="0.3"/>
          <path className="animated-wave-2" d="M0 34C120 34 240 18 360 18C480 18 600 42 720 42C840 42 960 12 1080 12C1200 12 1320 30 1440 30V74H0V34Z" fill="var(--bg-secondary)" opacity="0.5"/>
          <path className="animated-wave-3" d="M0 44C120 44 240 32 360 32C480 32 600 14 720 14C840 14 960 38 1080 38C1200 38 1320 20 1440 20V74H0V44Z" fill="var(--bg-secondary)"/>
        </svg>
      </div>

      {/* 2. SELECT DESTINATION SECTION */}
      <section style={{ padding: 'var(--space-4xl) 0', background: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden' }}>
        {/* Soft water bubbles decoration */}
        <div className="water-bubble" style={{ position: 'absolute', top: '10%', left: '5%', width: '60px', height: '60px', borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.7), rgba(59,130,246,0.1))', opacity: 0.2, filter: 'blur(2px)', animation: 'float 6s ease-in-out infinite' }}></div>
        <div className="water-bubble" style={{ position: 'absolute', bottom: '15%', right: '8%', width: '90px', height: '90px', borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.7), rgba(59,130,246,0.1))', opacity: 0.15, filter: 'blur(1px)', animation: 'float 9s ease-in-out infinite' }}></div>
        
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }} className="animate-fade-in-up">
            <span style={{ color: 'var(--gold-600)', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block', fontSize: 'var(--font-size-sm)' }}>
              {t('destinations.title')}
            </span>
            <h2 className="section-title">{t('destinations.subtitle')}</h2>
            <p className="section-subtitle">{t('destinations.desc')}</p>
          </div>

          {/* Grid layout for destinations, stacked vertically (column) */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '2.5rem',
            margin: '0 auto',
            maxWidth: '1100px',
            width: '100%'
          }}>
            {cities.map((city, idx) => {
              const locCity = getLocalizedCity(city, locale);
              return (
                <Link 
                  href={`/city/${city.slug}`}
                  key={city.id}
                  className="destination-card"
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: '1.2rem',
                    textDecoration: 'none',
                    position: 'relative',
                    width: '100%',
                    padding: '2rem var(--space-md) var(--space-lg) var(--space-md)',
                    borderRadius: '24px',
                    background: 'var(--bg-glass)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid var(--border-subtle)',
                    boxShadow: 'var(--shadow-md)',
                    transition: 'all var(--transition-base)',
                    animationDelay: `${idx * 0.08}s`,
                  }}
                >
                  {/* Oval-shaped Image wrapper positioned on top of the text */}
                  <div style={{
                    width: '140px',
                    height: '105px',
                    borderRadius: '140px / 105px', // Exact elliptical / oval shape
                    overflow: 'hidden',
                    border: '3px solid var(--gold-400)',
                    boxShadow: 'var(--shadow-glow-gold)',
                    position: 'relative',
                    flexShrink: 0,
                    transition: 'all var(--transition-base)'
                  }} className="oval-thumbnail-wrapper">
                    <OptimizedImage
                      src={city.image}
                      alt={locCity.name}
                      width={140}
                      height={105}
                      style={{ 
                        objectFit: 'cover',
                        width: '100%',
                        height: '100%',
                      }}
                      className="oval-thumbnail"
                      sizes="140px"
                    />
                  </div>

                  {/* Text info positioned below the image */}
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                      {locCity.name}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                      {locCity.description}
                    </p>
                  </div>
                  
                  {/* Arrow/Explore label */}
                  <div style={{ 
                    color: 'var(--gold-600)', 
                    fontWeight: 'bold', 
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    transition: 'transform var(--transition-base)'
                  }} className="explore-label">
                    <span>{t('common.learnMore')}</span>
                    <span className="arrow-icon">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* SVG Wave Divider before Why Choose Us */}
      <div style={{ position: 'relative', width: '100%', overflow: 'hidden', height: '40px', background: 'var(--bg-tertiary)', pointerEvents: 'none' }}>
        <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block', transform: 'rotate(180deg)' }}>
          <path d="M0 0C240 30 480 30 720 0C960 30 1200 30 1440 0V40H0V0Z" fill="var(--bg-secondary)"/>
        </svg>
      </div>

      {/* 3. PREMIUM ADVANTAGES SECTION */}
      <LazySection fallback={<SectionSkeleton height="400px" />}>
      <section style={{ padding: 'var(--space-4xl) 0', background: 'var(--bg-tertiary)', borderTop: '1px solid var(--border-subtle)', position: 'relative' }}>
        <div className="container" style={{ maxWidth: '850px' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ color: 'var(--gold-600)', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block', fontSize: 'var(--font-size-sm)' }}>
              {storyTitle}
            </span>
            <h2 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
              {locale === 'ar' ? 'تخيّل أنك قررت أن تمنح نفسك السعادة…' : 'Imagine Giving Yourself Happiness…'}
            </h2>
            <div style={{ width: '80px', height: '3px', background: 'var(--gold-400)', margin: '0 auto' }}></div>
          </div>

          <div className="glass-card" style={{
            padding: '3rem var(--space-xl)',
            background: 'var(--bg-secondary)',
            border: '2px solid var(--border-accent)',
            borderRadius: '24px',
            boxShadow: 'var(--shadow-lg), var(--shadow-glow-gold)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Elegant quotes background icon */}
            <div style={{
              position: 'absolute',
              top: '1.5rem',
              left: locale === 'ar' ? 'auto' : '2.5rem',
              right: locale === 'ar' ? '2.5rem' : 'auto',
              fontSize: '8rem',
              color: 'var(--gold-500)',
              opacity: 0.08,
              lineHeight: 1,
              fontFamily: 'serif',
              pointerEvents: 'none'
            }}>
              “
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              textAlign: locale === 'ar' ? 'right' : 'left',
              lineHeight: '1.85',
              fontSize: '1.12rem',
              color: 'var(--text-primary)',
              position: 'relative',
              zIndex: 2,
              fontFamily: 'inherit'
            }}>
              {storyParagraphs.map((paragraph, idx) => (
                <p 
                  key={idx} 
                  style={{ 
                    margin: 0,
                    textIndent: '0.5rem',
                    fontWeight: paragraph.includes('ORLUXUS') || paragraph.includes('نحن لا نبيع') ? '700' : '500'
                  }}
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Signature Divider */}
            <div style={{
              marginTop: '3rem',
              borderTop: '1px solid rgba(251, 191, 36, 0.2)',
              paddingTop: '2rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <span style={{
                fontFamily: 'var(--font-en)',
                fontSize: '1.8rem',
                fontWeight: '900',
                letterSpacing: '3px',
                background: 'linear-gradient(135deg, var(--gold-400), var(--gold-600))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                ORLUXUS
              </span>
              <span style={{
                color: 'var(--text-secondary)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: '600',
                letterSpacing: '1px'
              }}>
                {t('footer.tagline')}
              </span>
            </div>
          </div>
        </div>
      </section>
      </LazySection>

      {/* 4. CLIENT TESTIMONIALS SECTION */}
      <LazySection fallback={<SectionSkeleton height="500px" />}>
      <section style={{ padding: 'var(--space-4xl) 0', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)', position: 'relative' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ color: 'var(--gold-600)', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block', fontSize: 'var(--font-size-sm)' }}>
              {t('reviews.title')}
            </span>
            <h2 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: '800', color: 'var(--text-primary)' }}>{t('reviews.subtitle')}</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              {t('reviews.readWrite')}
            </p>
          </div>

          {/* Review Form - Interactive */}
          <div style={{ maxWidth: '600px', margin: '0 auto 3rem auto' }}>
            <div className="glass-card" style={{
              padding: '2rem',
              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.05), rgba(59, 130, 246, 0.05))',
              border: '1px solid rgba(251, 191, 36, 0.2)',
              borderRadius: '12px'
            }}>
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.2rem' }}>{t('reviews.share')}</h3>
              <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Name */}
                <input
                  type="text"
                  placeholder={t('reviews.name')}
                  value={reviewForm.name}
                  onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'rgba(255,255,255,0.04)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '6px',
                    outline: 'none',
                  }}
                />
                
                {/* Country */}
                <input
                  type="text"
                  placeholder={t('reviews.country')}
                  value={reviewForm.country}
                  onChange={(e) => setReviewForm({ ...reviewForm, country: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'rgba(255,255,255,0.04)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '6px',
                    outline: 'none',
                  }}
                />

                {/* Rating Stars */}
                <div>
                  <label style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block', fontWeight: 'bold' }}>{t('reviews.rating')}</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }} className="stars-row">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '2.2rem',
                          cursor: 'pointer',
                          opacity: (hoverRating || reviewForm.rating) >= star ? 1 : 0.3,
                          filter: (hoverRating || reviewForm.rating) >= star ? 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))' : 'none',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <textarea
                  placeholder={t('reviews.textPlaceholder')}
                  value={reviewForm.text}
                  onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'rgba(255,255,255,0.04)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '6px',
                    outline: 'none',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />

                <button
                  type="submit"
                  style={{
                    padding: '12px',
                    background: 'linear-gradient(135deg, var(--gold-600), var(--gold-400))',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(251, 191, 36, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(251, 191, 36, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(251, 191, 36, 0.3)';
                  }}
                >
                  {t('reviews.submit')}
                </button>
              </form>
            </div>
          </div>

          {/* Display Reviews */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--space-xl)',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            {reviews && reviews.length > 0 ? reviews.map((test, idx) => (
              <div key={test.id || idx} className="glass-card" style={{
                textAlign: 'left',
                padding: '2rem',
                background: 'var(--bg-primary)',
                border: '1px solid rgba(217, 119, 6, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem'
              }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic', lineHeight: '1.6' }}>
                  &quot;{test.text}&quot;
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.8rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{test.name}</h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{test.country}</span>
                  </div>
                  <div style={{ color: 'var(--gold-400)', fontSize: '0.95rem' }}>
                    {'★'.repeat(Math.max(1, test.rating || 0))}
                  </div>
                </div>
              </div>
            )) : <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{t('reviews.noReviews')}</p>}
          </div>
        </div>
      </section>
      </LazySection>

      {/* 5. DYNAMIC LUXURY COMPANY FOOTER */}
      <footer style={{
        background: '#090d16',
        color: '#ffffff',
        padding: '4rem 0 2rem 0',
        borderTop: '2px solid rgba(251, 191, 36, 0.2)',
        marginTop: 'auto',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '3rem', textAlign: 'left', paddingBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'relative', zIndex: 2 }}>
          
          {/* Logo & Slogan */}
          <div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--gold-400)', marginBottom: '1rem', letterSpacing: '1px' }}>
              {siteName.toUpperCase()}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'var(--font-size-sm)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Exceptional Egyptian excursions with a warm family spirit. Book premium safaris, yacht trips, and city packages securely.
            </p>
            <div style={{ fontSize: '1.2rem', color: 'var(--gold-400)' }}>
              🛥️ 🐫 🏛️ ✈️
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('nav.cities')}</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: 0 }}>
              {cities.map((city) => {
                const loc = getLocalizedCity(city, locale);
                return (
                  <li key={city.id}>
                    <Link href={`/city/${city.slug}`} style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'var(--font-size-sm)', transition: 'color var(--transition-fast)' }} className="footer-link">
                      {loc.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Contact Support */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('common.customSupport')}</h4>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'var(--font-size-sm)', marginBottom: '1rem' }}>
              {t('common.supportDesc')}
            </p>
            <a 
              href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#10b981',
                color: '#ffffff',
                padding: '8px 18px',
                borderRadius: '999px',
                fontWeight: 'bold',
                fontSize: '0.85rem'
              }}
            >
              {t('common.whatsappBtn')}
            </a>
          </div>

          {/* Social Media Links - Dynamic */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('common.followUs')}</h4>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'var(--font-size-sm)', marginBottom: '1.2rem' }}>
              {t('common.followUsDesc')}
            </p>
            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
              {socialMedia.facebook && (
                <a href={socialMedia.facebook} target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(59, 89, 152, 0.3)',
                  border: '1px solid rgba(59, 89, 152, 0.5)',
                  color: '#3b5998',
                  fontSize: '1.2rem',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }} 
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(59, 89, 152, 0.7)';
                  e.target.style.boxShadow = '0 0 20px rgba(59, 89, 152, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(59, 89, 152, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}>
                  👍
                </a>
              )}
              {socialMedia.instagram && (
                <a href={socialMedia.instagram} target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(217, 119, 6, 0.3)',
                  border: '1px solid rgba(217, 119, 6, 0.5)',
                  color: '#E4405F',
                  fontSize: '1.2rem',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(217, 119, 6, 0.7)';
                  e.target.style.boxShadow = '0 0 20px rgba(217, 119, 6, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(217, 119, 6, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}>
                  📷
                </a>
              )}
              {socialMedia.tiktok && (
                <a href={socialMedia.tiktok} target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  fontSize: '1.2rem',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(0, 0, 0, 0.7)';
                  e.target.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(0, 0, 0, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}>
                  🎵
                </a>
              )}
              {socialMedia.email && (
                <a href={`mailto:${socialMedia.email}`} style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(251, 191, 36, 0.3)',
                  border: '1px solid rgba(251, 191, 36, 0.5)',
                  color: '#FBCF24',
                  fontSize: '1.2rem',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(251, 191, 36, 0.7)';
                  e.target.style.boxShadow = '0 0 20px rgba(251, 191, 36, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(251, 191, 36, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}>
                  📧
                </a>
              )}
            </div>
          </div>

        </div>

        {/* Dynamic Copyright */}
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginTop: '2rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', position: 'relative', zIndex: 2 }}>
          <span>{t('footer.copyright', { year: new Date().getFullYear(), siteName })}</span>
          <span>{t('common.designedBy')}</span>
        </div>
      </footer>

      {/* Styled hovering effects */}
      <style jsx global>{`
        .quick-chip:hover {
          background: var(--gold-400) !important;
          color: #07111b !important;
          transform: translateY(-2px);
          border-color: var(--gold-400) !important;
          box-shadow: var(--shadow-glow-gold) !important;
        }
        .destination-card:hover {
          transform: translateY(-5px);
          border-color: var(--gold-500) !important;
          box-shadow: var(--shadow-lg), var(--shadow-glow-gold) !important;
          background: var(--bg-card-hover) !important;
        }
        .destination-card:hover .oval-thumbnail-wrapper {
          transform: scale(1.05);
          border-color: var(--gold-500) !important;
          box-shadow: 0 0 30px rgba(217, 119, 6, 0.3) !important;
        }
        .destination-card:hover .explore-label {
          color: var(--gold-700) !important;
        }
        .destination-card:hover .arrow-icon {
          transform: translateX(5px);
        }
        .footer-link:hover {
          color: var(--gold-400) !important;
          padding-left: 4px;
        }
        
        /* Water wave animations */
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
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }
        
        @keyframes kenburns {
          from { transform: scale(1.02) translate(0, 0); }
          to { transform: scale(1.08) translate(0.5%, -0.5%); }
        }
        
        .water-bg-pattern {
          background-image: radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.02) 0%, transparent 40%),
                            radial-gradient(circle at 90% 80%, rgba(37, 99, 235, 0.02) 0%, transparent 45%),
                            linear-gradient(var(--bg-primary), var(--bg-primary));
        }

        html[dir="rtl"] .stars-row {
          flex-direction: row-reverse;
        }
      `}</style>
    </main>
  );
}
