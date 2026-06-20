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

const CONTENT_FALLBACKS = {
  vision: {
    ar: 'رؤيتنا هي تقديم أرقى مستويات الخدمة السياحية الفاخرة في مصر بروح عائلية دافئة، لتكون كل رحلة قصة لا تُنسى لضيوفنا.',
    en: 'Our vision is to provide the highest levels of luxury tourism in Egypt with a warm family spirit, making every journey an unforgettable story.'
  },
  goals: {
    ar: 'نهدف إلى توفير حجز فوري آمن، وتنظيم رحلات استثنائية ذات جودة عالية، وتوفير أقصى درجات الراحة والأمان لعملائنا.',
    en: 'We aim to provide secure instant bookings, organize exceptional high-quality tours, and deliver the utmost comfort and safety.'
  },
  sustainability: {
    ar: 'نلتزم في أورلوكسوس بحماية البيئة البحرية والشواطئ المصرية، ودعم المجتمعات المحلية عبر توفير فرص عمل مستدامة وتطبيق أعلى معايير السياحة الخضراء.',
    en: 'We are committed to protecting the marine environment, supporting local communities through sustainable employment, and applying green tourism standards.'
  },
  staff: {
    ar: 'فريقنا يتكون من مرشدين سياحيين محترفين وخبراء محليين مدربين على أعلى معايير الضيافة والسلامة لضمان خدمة استثنائية على مدار الساعة.',
    en: 'Our team consists of professional tour guides and local experts trained to the highest hospitality standards.'
  },
  legalCompany: {
    ar: 'أورلوكسوس هي شركة سياحية مسجلة ومرخصة رسمياً من وزارة السياحة المصرية، وتخضع للقوانين المصرية المنظمة للنشاط السياحي.',
    en: 'ORLUXUS is a fully registered and licensed tourism company operating under the regulations of the Egyptian Ministry of Tourism.'
  },
  legalCancellation: {
    ar: 'يمكن إلغاء الحجز مجاناً قبل 48 ساعة من موعد الرحلة. في حال الإلغاء المتأخر أو عدم الحضور، يتم تطبيق رسوم إلغاء تعادل قيمة الليلة الأولى أو 50% من قيمة الرحلة حسب نوع البرنامج.',
    en: 'Cancellations made 48 hours prior to the trip are free. Late cancellations or no-shows are subject to fees up to 50% depending on the program.'
  },
  dataProtection: {
    ar: 'نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. لن يتم مشاركة معلوماتك أو تفاصيل حجزك مع أي أطراف ثالثة إلا لغرض إتمام الحجز وتقديم الخدمة.',
    en: 'We respect your privacy and commit to protecting your personal data. We do not share your information with third parties except for bookings.'
  }
};

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

  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', content: '' });

  const handleOpenContentModal = useCallback((type, titleAr, titleEn) => {
    if (typeof window !== 'undefined') {
      const isAr = locale === 'ar';
      const storageKey = {
        vision: 'orluxus_about_vision',
        goals: 'orluxus_about_goals',
        sustainability: 'orluxus_about_sustainability',
        staff: 'orluxus_about_staff',
        legalCompany: 'orluxus_legal_company',
        legalCancellation: 'orluxus_legal_cancellation',
        dataProtection: 'orluxus_data_protection'
      }[type];
      
      const fallback = CONTENT_FALLBACKS[type]?.[isAr ? 'ar' : 'en'] || '';
      const content = localStorage.getItem(storageKey) || fallback;
      setModalConfig({ isOpen: true, title: isAr ? titleAr : titleEn, content });
    }
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
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', textAlign: locale === 'ar' ? 'right' : 'left', paddingBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'relative', zIndex: 2 }}>
          
          {/* Column 1: Logo & Slogan */}
          <div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--gold-400)', marginBottom: '1rem', letterSpacing: '1px' }}>
              {siteName.toUpperCase()}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'var(--font-size-sm)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              {locale === 'ar' ? 'رحلات سياحية مصرية استثنائية بروح عائلية دافئة. احجز رحلات السفاري واليخوت والجولات بأمان.' : 'Exceptional Egyptian excursions with a warm family spirit. Book premium safaris, yacht trips, and city packages securely.'}
            </p>
          </div>

          {/* Column 2: About Us (عننا) */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {locale === 'ar' ? 'عننا' : 'About Us'}
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: 0, listStyle: 'none' }}>
              <li>
                <button onClick={() => handleOpenContentModal('vision', 'رؤيتنا', 'Our Vision')} className="footer-btn-link" style={{ background: 'none', border: 'none', padding: 0, color: 'rgba(255,255,255,0.6)', fontSize: 'var(--font-size-sm)', cursor: 'pointer', transition: 'color var(--transition-fast)' }}>
                  {locale === 'ar' ? 'رؤيتنا' : 'Our Vision'}
                </button>
              </li>
              <li>
                <button onClick={() => handleOpenContentModal('goals', 'أهدافنا', 'Our Goals')} className="footer-btn-link" style={{ background: 'none', border: 'none', padding: 0, color: 'rgba(255,255,255,0.6)', fontSize: 'var(--font-size-sm)', cursor: 'pointer', transition: 'color var(--transition-fast)' }}>
                  {locale === 'ar' ? 'أهدافنا' : 'Our Goals'}
                </button>
              </li>
              <li>
                <button onClick={() => handleOpenContentModal('sustainability', 'الاستدامة', 'Sustainability')} className="footer-btn-link" style={{ background: 'none', border: 'none', padding: 0, color: 'rgba(255,255,255,0.6)', fontSize: 'var(--font-size-sm)', cursor: 'pointer', transition: 'color var(--transition-fast)' }}>
                  {locale === 'ar' ? 'الاستدامة' : 'Sustainability'}
                </button>
              </li>
              <li>
                <button onClick={() => handleOpenContentModal('staff', 'موظفونا', 'Our Staff')} className="footer-btn-link" style={{ background: 'none', border: 'none', padding: 0, color: 'rgba(255,255,255,0.6)', fontSize: 'var(--font-size-sm)', cursor: 'pointer', transition: 'color var(--transition-fast)' }}>
                  {locale === 'ar' ? 'موظفونا' : 'Our Staff'}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal (قانوني) & Data Protection */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {locale === 'ar' ? 'قانوني' : 'Legal'}
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: 0, listStyle: 'none' }}>
              <li>
                <button onClick={() => handleOpenContentModal('legalCompany', 'الوضع القانوني للشركة', 'Company Legal Status')} className="footer-btn-link" style={{ background: 'none', border: 'none', padding: 0, color: 'rgba(255,255,255,0.6)', fontSize: 'var(--font-size-sm)', cursor: 'pointer', transition: 'color var(--transition-fast)' }}>
                  {locale === 'ar' ? 'الوضع القانوني للشركة' : 'Company Legal Status'}
                </button>
              </li>
              <li>
                <button onClick={() => handleOpenContentModal('legalCancellation', 'سياسة الإلغاء', 'Cancellation Policy')} className="footer-btn-link" style={{ background: 'none', border: 'none', padding: 0, color: 'rgba(255,255,255,0.6)', fontSize: 'var(--font-size-sm)', cursor: 'pointer', transition: 'color var(--transition-fast)' }}>
                  {locale === 'ar' ? 'سياسة الإلغاء' : 'Cancellation Policy'}
                </button>
              </li>
              <li>
                <button onClick={() => handleOpenContentModal('dataProtection', 'حماية البيانات', 'Data Protection')} className="footer-btn-link" style={{ background: 'none', border: 'none', padding: 0, color: 'rgba(255,255,255,0.6)', fontSize: 'var(--font-size-sm)', cursor: 'pointer', transition: 'color var(--transition-fast)' }}>
                  {locale === 'ar' ? 'حماية البيانات' : 'Data Protection'}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Join Us (وظائف) & Payment Methods */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {locale === 'ar' ? 'انضم إلينا' : 'Join Us'}
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: 0, listStyle: 'none', marginBottom: '1.5rem' }}>
              <li>
                <Link href="/agent/login" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'var(--font-size-sm)', textDecoration: 'none', transition: 'color var(--transition-fast)' }} className="footer-link">
                  {locale === 'ar' ? 'شركاء والوكلاء (بروفايل الأرباح)' : 'Partners & Agents Profile'}
                </Link>
              </li>
            </ul>

            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {locale === 'ar' ? 'طرق الدفع' : 'Payment Methods'}
            </h4>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: 0 }}>
              {locale === 'ar' ? 'فيزا، ماستركارد، باي بال، تحويل بنكي (سيتم تحديدها لاحقاً)' : 'Visa, Mastercard, PayPal, Bank Transfer (To be specified)'}
            </p>
          </div>

          {/* Column 5: Contact Support */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('common.customSupport')}</h4>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'var(--font-size-sm)', marginBottom: '1rem' }}>
              {locale === 'ar' ? `تواصل معنا عبر البريد: ${socialMedia.email || 'info@orluxus.com'}` : `Contact us via email: ${socialMedia.email || 'info@orluxus.com'}`}
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
                fontSize: '0.85rem',
                textDecoration: 'none'
              }}
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" style={{ verticalAlign: 'middle' }}><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.247 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.313 1.592 5.528.002 10.026-4.495 10.028-10.024.001-2.678-1.043-5.197-2.939-7.094-1.896-1.897-4.417-2.94-7.098-2.94-5.529 0-10.026 4.497-10.028 10.026-.001 2.081.545 3.738 1.582 5.269l-.999 3.648 3.743-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.174.2-.298.3-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
              <span style={{ marginInlineStart: '6px' }}>{t('common.whatsappBtn')}</span>
            </a>
          </div>

          {/* Column 6: Follow Us */}
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
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }} 
                className="social-btn"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#3b5998';
                  e.currentTarget.style.borderColor = '#3b5998';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(59, 89, 152, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
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
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
                className="social-btn"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)';
                  e.currentTarget.style.borderColor = '#e6683c';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(220, 39, 67, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
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
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
                className="social-btn"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#000000';
                  e.currentTarget.style.borderColor = '#ffffff';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.95.83 2.19 1.34 3.48 1.47V9.7c-1.69-.17-3.24-.85-4.47-1.95v7.69c0 4.36-3.88 7.74-8.25 7.07-3.45-.53-6.05-3.61-5.95-7.11.16-3.87 3.65-6.85 7.52-6.22v4.06c-1.95-.51-4.04.53-4.52 2.5-.56 2.29.98 4.6 3.32 4.67 2.13.06 4.02-1.63 4.02-3.87.02-5.54.01-11.08.01-16.62z"/></svg>
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
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
                className="social-btn"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--gold-600)';
                  e.currentTarget.style.borderColor = 'var(--gold-500)';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(251, 191, 36, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M0 3v18h24v-18h-24zm6.623 7.929l-4.623 5.712v-9.458l4.623 3.746zm-4.141-5.929h19.036l-9.518 7.713-9.518-7.713zm5.694 7.188l3.824 3.099 3.83-3.104 5.612 6.818h-18.905l5.639-6.813zm9.201-.735l4.623-3.746v9.458l-4.623-5.712z"/></svg>
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

      {/* Policy Content Modal */}
      {modalConfig.isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10, 14, 23, 0.85)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }} onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '2px solid var(--border-accent)',
            borderRadius: '24px',
            boxShadow: 'var(--shadow-xl), var(--shadow-glow-gold)',
            maxWidth: '600px',
            width: '100%',
            padding: '2.5rem',
            position: 'relative',
            textAlign: locale === 'ar' ? 'right' : 'left',
            animation: 'fadeInUp 0.3s ease-out'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <button 
              onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}
              style={{
                position: 'absolute',
                top: '1.2rem',
                left: locale === 'ar' ? '1.2rem' : 'auto',
                right: locale === 'ar' ? 'auto' : '1.2rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: 'none',
                outline: 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(251, 191, 36, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              ✕
            </button>

            <h3 style={{
              fontSize: '1.4rem',
              fontWeight: '800',
              marginBottom: '1.5rem',
              color: 'var(--gold-400)',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '0.8rem',
              paddingInlineEnd: '2.5rem'
            }}>
              {modalConfig.title}
            </h3>

            <div style={{
              fontSize: '1.05rem',
              lineHeight: '1.75',
              color: 'var(--text-primary)',
              whiteSpace: 'pre-wrap',
              maxHeight: '60vh',
              overflowY: 'auto',
              paddingInlineEnd: '8px'
            }}>
              {modalConfig.content}
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}
                className="btn btn-primary"
                style={{ padding: '8px 24px', borderRadius: '8px' }}
              >
                {locale === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

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
