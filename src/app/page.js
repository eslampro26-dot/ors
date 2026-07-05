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
  const [destinationsOverride, setDestinationsOverride] = useState({});
  
  const { locale, t, isReady } = useLanguage();

  const [heroActiveIndex, setHeroActiveIndex] = useState(0);

  const HERO_IMAGES = useMemo(() => [
    'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1600&q=80', // Pyramids
    'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?auto=format&fit=crop&w=1600&q=80', // Hurghada
    'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1600&q=80', // Luxor
    'https://images.unsplash.com/photo-1600016688773-bc18bf39aa3e?auto=format&fit=crop&w=1600&q=80'  // Abu Simbel (Aswan)
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
      
      const title = t(`footer.${type}Title`) || (isAr ? titleAr : titleEn);
      const fallback = t(`footer.${type}Body`) || CONTENT_FALLBACKS[type]?.[isAr ? 'ar' : 'en'] || '';
      const content = localStorage.getItem(storageKey) || fallback;
      setModalConfig({ isOpen: true, title, content });
    }
  }, [locale, t]);

  // Review Form States
  const [reviewForm, setReviewForm] = useState({
    name: '',
    country: '',
    rating: 0,
    text: '',
    image: ''
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [emergencyPhone, setEmergencyPhone] = useState('');

  const handleReviewImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 200;
        const MAX_HEIGHT = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setReviewForm(prev => ({ ...prev, image: dataUrl }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Safely sync company details and reviews from LocalStorage after hydration
  useEffect(() => {
    const loadData = async () => {
      if (typeof window !== 'undefined') {
        const savedName = localStorage.getItem('orluxus_site_name');
        const savedPhone = localStorage.getItem('orluxus_whatsapp');
        if (savedName) setSiteName(savedName);
        if (savedPhone) setWhatsapp(savedPhone);

        try {
          // Load settings for emergency phone and destinations
          const { getSettings } = require('@/lib/db');
          const settings = await getSettings();
          if (settings?.emergencyPhone) {
            setEmergencyPhone(settings.emergencyPhone);
          }
          if (settings?.destinations) {
            setDestinationsOverride(settings.destinations);
          }

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
        text: reviewForm.text,
        image: reviewForm.image || ''
      });

      if (newReview) {
        setReviews(prev => [newReview, ...prev]);
        setReviewForm({ name: '', country: '', rating: 0, text: '', image: '' });
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
    <main id="main-content" style={{ minHeight: '100vh', background: 'transparent', display: 'flex', flexDirection: 'column' }} className="water-bg-pattern">
      <Navbar />
      
      {/* 1. HERO SECTION */}
      <section style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '0 var(--space-xl)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Luxury Yacht Background Image instead of video to prevent CORS blocks */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            backgroundImage: 'url("https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1600&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 1
          }}
        />

        {/* 40% Dark Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(11, 11, 11, 0.4)',
          zIndex: 2
        }}></div>

        <div className="container" style={{ position: 'relative', zIndex: 10, maxWidth: '900px' }}>
          <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            
            <h1 style={{ 
              fontSize: 'clamp(2rem, 5vw, 3.8rem)', 
              fontWeight: 700, 
              color: '#FFFFFF',
              lineHeight: 1.2,
              letterSpacing: '1px',
              fontFamily: 'var(--font-title)',
              textShadow: '0 4px 20px rgba(0,0,0,0.6)',
              textTransform: 'uppercase',
            }}>
              {locale === 'ar' ? 'أورلوكسوس | كشف النقاب عن الفخامة الحصرية' : 'ORLUXUS | UNVEIL EXCLUSIVE LUXURY'}
            </h1>
            
            <p style={{ 
              fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', 
              color: '#F5F5F5',
              fontWeight: '400',
              fontFamily: 'var(--font-en)',
              lineHeight: 1.5,
              textShadow: '0 2px 10px rgba(0,0,0,0.6)',
              maxWidth: '650px',
              margin: '0 auto'
            }}>
              {locale === 'ar' 
                ? 'تجارب سياحية منتقاة للمسافر الشغوف، حيث تلتقي الرفاهية والمغامرة في أجمل الوجهات المصرية.' 
                : 'Curated experiences for the discerning traveler, where sophistication meets unparalleled adventure.'}
            </p>
            
            <div style={{ marginTop: '2rem' }}>
              <a href="#destinations" className="btn" style={{ 
                padding: '16px 40px', 
                fontSize: '16px', 
                borderRadius: '999px',
                fontWeight: '700',
                background: 'var(--gold-500)',
                color: locale === 'ar' ? '#FFFFFF' : '#FFFFFF', // Keep it white for premium visibility
                boxShadow: '0 8px 30px rgba(201, 162, 39, 0.4)', 
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 12px 35px rgba(201, 162, 39, 0.6)';
                e.target.style.background = 'var(--gold-600)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 8px 30px rgba(201, 162, 39, 0.4)';
                e.target.style.background = 'var(--gold-500)';
              }}
              >
                {locale === 'ar' ? 'اكتشف رحلتك' : 'DISCOVER YOUR JOURNEY'}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Water Waves Transition Divider */}
      <div style={{ position: 'relative', width: '100%', overflow: 'hidden', height: '80px', marginTop: '-80px', zIndex: 11, pointerEvents: 'none' }}>
        <svg viewBox="0 0 1440 74" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
          <path className="animated-wave-1" d="M0 24C120 24 240 40 360 40C480 40 600 8 720 8C840 8 960 48 1080 48C1200 48 1320 16 1440 16V74H0V24Z" fill="transparent" opacity="0.3"/>
          <path className="animated-wave-2" d="M0 34C120 34 240 18 360 18C480 18 600 42 720 42C840 42 960 12 1080 12C1200 12 1320 30 1440 30V74H0V34Z" fill="transparent" opacity="0.5"/>
          <path className="animated-wave-3" d="M0 44C120 44 240 32 360 32C480 32 600 14 720 14C840 14 960 38 1080 38C1200 38 1320 20 1440 20V74H0V44Z" fill="transparent"/>
        </svg>
      </div>

      {/* 2. SELECT DESTINATION SECTION */}
      <section id="destinations" style={{ padding: 'var(--space-4xl) 0', background: 'transparent', position: 'relative', overflow: 'hidden' }}>
        {/* Soft water bubbles decoration */}
        <div className="water-bubble" style={{ position: 'absolute', top: '10%', left: '5%', width: '60px', height: '60px', borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.7), rgba(59,130,246,0.1))', opacity: 0.2, filter: 'blur(2px)', animation: 'float 6s ease-in-out infinite' }}></div>
        <div className="water-bubble" style={{ position: 'absolute', bottom: '15%', right: '8%', width: '90px', height: '90px', borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.7), rgba(59,130,246,0.1))', opacity: 0.15, filter: 'blur(1px)', animation: 'float 9s ease-in-out infinite' }}></div>
        
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }} className="animate-fade-in-up">
            <span style={{ color: 'var(--gold-500)', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block', fontSize: 'var(--font-size-xs)' }}>
              {t('destinations.title')}
            </span>
            <h2 className="section-title" style={{ fontFamily: 'var(--font-title)', fontSize: 'clamp(2rem, 4vw, 2.5rem)', color: 'var(--text-primary)', marginBottom: '1rem' }}>
              {t('destinations.subtitle')}
            </h2>
            <p className="section-subtitle" style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>{t('destinations.desc')}</p>
          </div>

          {/* Grid layout for destinations */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '2rem',
            margin: '0 auto',
            maxWidth: '1200px',
            width: '100%'
          }}>
            {cities.map((city, idx) => {
              const override = destinationsOverride[city.slug] || {};
              // Build dynamic localized city
              const dynamicCity = {
                ...city,
                image: override.image || city.image,
                nameAr: override.nameAr || city.nameAr,
                nameEn: override.nameEn || city.nameEn,
                descriptionAr: override.descriptionAr || city.descriptionAr,
                descriptionEn: override.descriptionEn || city.descriptionEn,
                descriptions: {
                  ...city.descriptions,
                  ar: override.descriptionAr || city.descriptions.ar,
                  en: override.descriptionEn || city.descriptions.en,
                }
              };
              
              const locCity = getLocalizedCity(dynamicCity, locale);
              return (
                <Link 
                  href={`/city/${city.slug}`}
                  key={city.id}
                  className="luxury-experience-card"
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    textDecoration: 'none',
                    position: 'relative',
                    width: '100%',
                    borderRadius: '20px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    boxShadow: 'var(--shadow-md)',
                    transition: 'all 300ms ease',
                    overflow: 'hidden',
                  }}
                >
                  {/* 16:9 Image wrapper */}
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    paddingTop: '56.25%', /* 16:9 Aspect Ratio */
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                    }}>
                      <OptimizedImage
                        src={city.image}
                        alt={locCity.name}
                        width={400}
                        height={225}
                        style={{ 
                          objectFit: 'cover',
                          width: '100%',
                          height: '100%',
                          transition: 'transform 300ms ease',
                        }}
                        className="card-image-hover"
                        sizes="(max-width: 768px) 100vw, 400px"
                      />
                    </div>
                    
                    {/* Overlay Tag: Price starts from */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: locale === 'ar' ? 'auto' : '12px',
                      left: locale === 'ar' ? '12px' : 'auto',
                      background: 'rgba(11, 11, 11, 0.75)',
                      backdropFilter: 'blur(8px)',
                      color: '#FFFFFF',
                      padding: '4px 12px',
                      borderRadius: '999px',
                      fontSize: '13px',
                      fontWeight: '600',
                      fontFamily: 'var(--font-en)',
                      zIndex: 2,
                    }}>
                      {locale === 'ar' ? 'تبدأ من €45' : 'from €45'}
                    </div>
                  </div>

                  {/* Info Content */}
                  <div style={{ 
                    padding: '1.2rem', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '0.6rem',
                    textAlign: locale === 'ar' ? 'right' : 'left'
                  }}>
                    {/* Stars & Category info */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ color: 'var(--gold-500)', fontSize: '12px' }}>
                        ★★★★★
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {locale === 'ar' ? 'وجهة فاخرة' : 'LUXURY DESTINATION'}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 style={{ 
                      fontSize: '1.15rem', 
                      fontWeight: '700', 
                      color: 'var(--text-primary)', 
                      margin: 0,
                      fontFamily: 'var(--font-title)'
                    }}>
                      {locCity.name}
                    </h3>

                    {/* Location/Desc Pin */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                      <span>📍</span>
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {locale === 'ar' ? 'مصر' : 'Egypt'} • {locCity.description.split(' ').slice(0, 4).join(' ')}...
                      </span>
                    </div>

                    {/* CTA Text */}
                    <div style={{ 
                      color: 'var(--gold-600)', 
                      fontWeight: '700', 
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '0.4rem',
                      transition: 'transform 300ms ease'
                    }} className="explore-label-cta">
                      <span>{locale === 'ar' ? 'عرض التفاصيل' : 'View Details'}</span>
                      <span className="arrow-icon" style={{ fontSize: '12px' }}>&gt;</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2.5 YOUR PERSONAL CONCIERGE SERVICE SECTION */}
      <section style={{
        padding: 'var(--space-4xl) 0',
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-subtle)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container" style={{ maxWidth: '1100px' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{ color: 'var(--gold-500)', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block', fontSize: 'var(--font-size-xs)' }}>
              {t('concierge.badge')}
            </span>
            <h2 style={{ fontFamily: 'var(--font-title)', fontSize: 'clamp(2rem, 4vw, 2.5rem)', color: 'var(--text-primary)', marginBottom: '1rem' }}>
              {t('concierge.title')}
            </h2>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6' }}>
              {t('concierge.desc')}
            </p>
          </div>

          {/* 3 Column Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '3rem var(--space-xl)',
            marginBottom: '4rem'
          }}>
            {/* 1. Private Jets */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(201,162,39,0.05)', border: '1px solid rgba(201,162,39,0.15)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C9A227" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-title)' }}>
                {t('concierge.jet')}
              </h3>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '300px' }}>
                {t('concierge.jetDesc')}
              </p>
            </div>

            {/* 2. Island Dining */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(201,162,39,0.05)', border: '1px solid rgba(201,162,39,0.15)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C9A227" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="8" />
                  <path d="M5 8v6a3 3 0 0 0 3 3h1V8H5zM19 8v6a3 3 0 0 1-3 3h-1V8h4zM12 12V8" />
                </svg>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-title)' }}>
                {t('concierge.dining')}
              </h3>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '300px' }}>
                {t('concierge.diningDesc')}
              </p>
            </div>

            {/* 3. Bespoke Itineraries */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(201,162,39,0.05)', border: '1px solid rgba(201,162,39,0.15)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C9A227" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M9 9h6M9 13h6M9 17h4" />
                </svg>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-title)' }}>
                {t('concierge.itinerary')}
              </h3>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '300px' }}>
                {t('concierge.itineraryDesc')}
              </p>
            </div>

            {/* 4. Safaris & Treks */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(201,162,39,0.05)', border: '1px solid rgba(201,162,39,0.15)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C9A227" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m8 3 4 8 5-5 5 15H2L8 3Z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-title)' }}>
                {t('concierge.safari')}
              </h3>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '300px' }}>
                {t('concierge.safariDesc')}
              </p>
            </div>

            {/* 5. Cafe Time */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(201,162,39,0.05)', border: '1px solid rgba(201,162,39,0.15)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C9A227" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8Z" />
                  <path d="M6 2v2M10 2v2M14 2v2" />
                </svg>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-title)' }}>
                {t('concierge.cafe')}
              </h3>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '300px' }}>
                {t('concierge.cafeDesc')}
              </p>
            </div>

            {/* 6. VIP Services */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(201,162,39,0.05)', border: '1px solid rgba(201,162,39,0.15)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C9A227" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-title)' }}>
                {locale === 'ar' ? 'حماية وخدمات VIP' : 'VIP Security & Services'}
              </h3>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '300px' }}>
                {locale === 'ar' ? 'حماية شخصية متكاملة وسيارات ليموزين مصفحة وسائقين محترفين لحمايتك.' : 'Premium executive security, armored limousines, and dedicated personal assistance.'}
              </p>
            </div>
          </div>

          {/* Proposal CTA Button */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <a 
              href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(locale === 'ar' ? 'مرحباً، أود الاستفسار عن عروض الكونسيرج الفاخرة.' : 'Hello, I would like to inquire about bespoke luxury concierge services.')}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn" 
              style={{
                padding: '16px 40px',
                fontSize: '16px',
                borderRadius: '999px',
                fontWeight: '700',
                background: 'var(--gold-500)',
                color: '#FFFFFF',
                boxShadow: '0 8px 30px rgba(201, 162, 39, 0.4)',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 12px 35px rgba(201, 162, 39, 0.6)';
                e.target.style.background = 'var(--gold-600)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 8px 30px rgba(201, 162, 39, 0.4)';
                e.target.style.background = 'var(--gold-500)';
              }}
            >
              {locale === 'ar' ? 'طلب عرض مخصص' : 'REQUEST A PROPOSAL'}
            </a>
          </div>
        </div>
      </section>

      {/* SVG Wave Divider before Why Choose Us */}
      <div style={{ position: 'relative', width: '100%', overflow: 'hidden', height: '40px', background: 'var(--bg-tertiary)', pointerEvents: 'none' }}>
        <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block', transform: 'rotate(180deg)' }}>
          <path d="M0 0C240 30 480 30 720 0C960 30 1200 30 1440 0V40H0V0Z" fill="transparent"/>
        </svg>
      </div>

      {/* 3. PREMIUM ADVANTAGES SECTION */}
      <LazySection fallback={<SectionSkeleton height="150px" />}>
      <section style={{ padding: 'var(--space-2xl) 0', background: 'transparent', borderTop: '1px solid var(--border-subtle)', position: 'relative' }}>
        <div className="container" style={{ maxWidth: '600px', textAlign: 'center' }}>
          <span style={{ color: 'var(--gold-600)', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block', fontSize: 'var(--font-size-sm)' }}>
            {storyTitle}
          </span>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
            {locale === 'ar' ? 'تخيّل أنك قررت أن تمنح نفسك السعادة…' : 'Imagine Giving Yourself Happiness…'}
          </h2>
          <div style={{ marginBottom: '2rem', fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {locale === 'ar' ? 'أيام تهرب فيها من ضغوط الحياة لتصنع ذكريات لا تُنسى. اكتشف كيف بدأنا ولماذا نسعى لخدمتك بروح عائلية دافئة.' : 'Days where you escape the pressures of life to make unforgettable memories. Discover how we began and why we serve you with a warm family spirit.'}
          </div>
          <Link href="/our-story" className="btn btn-primary" style={{ padding: '10px 28px', fontSize: '0.95rem', borderRadius: '30px' }}>
            {locale === 'ar' ? 'اقرأ قصتنا كاملة' : 'Read Our Full Story'}
          </Link>
        </div>
      </section>
      </LazySection>

      {/* 4. CLIENT TESTIMONIALS SECTION */}
      <LazySection fallback={<SectionSkeleton height="500px" />}>
      <section style={{ padding: 'var(--space-4xl) 0', background: 'transparent', borderTop: '1px solid var(--border-subtle)', position: 'relative' }}>
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

                {/* Photo Upload */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    {locale === 'ar' ? 'أضف صورتك الشخصية (اختياري)' : 'Add your profile photo (Optional)'}
                  </label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleReviewImageUpload}
                    style={{
                      width: '100%',
                      padding: '8px',
                      background: 'rgba(255,255,255,0.04)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '6px',
                      outline: 'none',
                      fontSize: '0.85rem'
                    }}
                  />
                  {reviewForm.image && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                      <img src={reviewForm.image} alt="Preview" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--emerald-400)' }}>✓ تم تحميل الصورة</span>
                      <button 
                        type="button" 
                        onClick={() => setReviewForm(prev => ({ ...prev, image: '' }))} 
                        style={{ background: 'none', border: 'none', color: 'var(--coral-500)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
                      >
                        إزالة
                      </button>
                    </div>
                  )}
                </div>

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
                textAlign: locale === 'ar' ? 'right' : 'left',
                padding: '1.5rem',
                background: 'var(--bg-primary)',
                border: '1px solid rgba(217, 119, 6, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
                borderRadius: '12px'
              }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic', lineHeight: '1.6', margin: 0 }}>
                  &quot;{test.text}&quot;
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.8rem', flexDirection: locale === 'ar' ? 'row-reverse' : 'row' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexDirection: locale === 'ar' ? 'row-reverse' : 'row' }}>
                    {test.image ? (
                      <img 
                        src={test.image} 
                        alt={test.name} 
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gold-500)' }} 
                      />
                    ) : (
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        background: 'rgba(255,255,255,0.06)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '1rem'
                      }}>
                        👤
                      </div>
                    )}
                    <div style={{ textAlign: locale === 'ar' ? 'right' : 'left' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>{test.name}</h4>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{test.country}</span>
                    </div>
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
          


          {/* Column 2: About Us (عننا) */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {t('footer.aboutUs')}
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: 0, listStyle: 'none' }}>
              <li>
                <button onClick={() => handleOpenContentModal('vision', 'رؤيتنا', 'Our Vision')} className="footer-btn-link" style={{ background: 'none', border: 'none', padding: 0, color: 'rgba(255,255,255,0.6)', fontSize: 'var(--font-size-sm)', cursor: 'pointer', transition: 'color var(--transition-fast)' }}>
                  {t('footer.ourVision')}
                </button>
              </li>
              <li>
                <button onClick={() => handleOpenContentModal('goals', 'أهدافنا', 'Our Goals')} className="footer-btn-link" style={{ background: 'none', border: 'none', padding: 0, color: 'rgba(255,255,255,0.6)', fontSize: 'var(--font-size-sm)', cursor: 'pointer', transition: 'color var(--transition-fast)' }}>
                  {t('footer.ourGoals')}
                </button>
              </li>
              <li>
                <button onClick={() => handleOpenContentModal('sustainability', 'الاستدامة', 'Sustainability')} className="footer-btn-link" style={{ background: 'none', border: 'none', padding: 0, color: 'rgba(255,255,255,0.6)', fontSize: 'var(--font-size-sm)', cursor: 'pointer', transition: 'color var(--transition-fast)' }}>
                  {t('footer.sustainability')}
                </button>
              </li>
              <li>
                <button onClick={() => handleOpenContentModal('staff', 'موظفونا', 'Our Staff')} className="footer-btn-link" style={{ background: 'none', border: 'none', padding: 0, color: 'rgba(255,255,255,0.6)', fontSize: 'var(--font-size-sm)', cursor: 'pointer', transition: 'color var(--transition-fast)' }}>
                  {t('footer.ourStaff')}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal (قانوني) & Data Protection */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {t('footer.legal')}
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: 0, listStyle: 'none' }}>
              <li>
                <button onClick={() => handleOpenContentModal('legalCompany', 'الوضع القانوني للشركة', 'Company Legal Status')} className="footer-btn-link" style={{ background: 'none', border: 'none', padding: 0, color: 'rgba(255,255,255,0.6)', fontSize: 'var(--font-size-sm)', cursor: 'pointer', transition: 'color var(--transition-fast)' }}>
                  {t('footer.companyLegalStatus')}
                </button>
              </li>
              <li>
                <button onClick={() => handleOpenContentModal('legalCancellation', 'سياسة الإلغاء', 'Cancellation Policy')} className="footer-btn-link" style={{ background: 'none', border: 'none', padding: 0, color: 'rgba(255,255,255,0.6)', fontSize: 'var(--font-size-sm)', cursor: 'pointer', transition: 'color var(--transition-fast)' }}>
                  {t('footer.cancellationPolicy')}
                </button>
              </li>
              <li>
                <button onClick={() => handleOpenContentModal('dataProtection', 'حماية البيانات', 'Data Protection')} className="footer-btn-link" style={{ background: 'none', border: 'none', padding: 0, color: 'rgba(255,255,255,0.6)', fontSize: 'var(--font-size-sm)', cursor: 'pointer', transition: 'color var(--transition-fast)' }}>
                  {t('footer.dataProtection')}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Join Us (وظائف) & Payment Methods */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {t('footer.joinUs')}
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: 0, listStyle: 'none', marginBottom: '1.5rem' }}>
              <li>
                <Link href="/agent/login" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'var(--font-size-sm)', textDecoration: 'none', transition: 'color var(--transition-fast)' }} className="footer-link">
                  {t('footer.partnersProfile')}
                </Link>
              </li>
            </ul>

            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {t('footer.paymentMethods')}
            </h4>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: 0 }}>
              {t('footer.paymentMethodsDesc')}
            </p>
          </div>

          {/* Column 5: Contact Support */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('common.customSupport')}</h4>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'var(--font-size-sm)', marginBottom: '1rem' }}>
              {t('footer.contactEmail') ? t('footer.contactEmail').replace('{email}', socialMedia.email || 'info@orluxus.com') : `Contact us via email: ${socialMedia.email || 'info@orluxus.com'}`}
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
            
            {emergencyPhone && (
              <a 
                href={`tel:${emergencyPhone.replace(/[^0-9+]/g, '')}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: '#ef4444',
                  color: '#ffffff',
                  padding: '8px 18px',
                  borderRadius: '999px',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                  marginTop: '0.5rem'
                }}
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ verticalAlign: 'middle' }}>
                  <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328z"/>
                </svg>
                <span style={{ marginInlineStart: '6px' }}>{locale === 'ar' ? 'الطوارئ' : 'Emergency'}</span>
              </a>
            )}
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
              {(socialMedia.email || 'info@orluxus.com') && (
                <a href={`mailto:${socialMedia.email || 'info@orluxus.com'}`} style={{
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
