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
import { useSettings, getPolicyText } from '@/hooks/useSettings';
import TranslatedText from '@/components/TranslatedText';

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
  const { settings: siteSettings } = useSettings();

  // GlobalBackground.js handles the background image slideshow — no need for a duplicate here

  const storyParagraphs = useMemo(() => {
    const msgs = getMessages(locale);
    return msgs.whyChooseUs?.story || messages.en.whyChooseUs.story;
  }, [locale]);

  const storyTitle = useMemo(() => {
    const msgs = getMessages(locale);
    return msgs.whyChooseUs?.storyTitle || messages.en.whyChooseUs.storyTitle;
  }, [locale]);

  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', content: '' });

  // DB field map: arField, enField for each policy type
  const POLICY_FIELDS = {
    vision:           { arField: 'vision',           enField: 'visionEn',           msgKey: 'footer.visionBody' },
    goals:            { arField: 'goals',             enField: 'goalsEn',             msgKey: 'footer.goalsBody' },
    sustainability:   { arField: 'sustainability',   enField: 'sustainabilityEn',   msgKey: 'footer.sustainabilityBody' },
    staff:            { arField: 'staff',             enField: 'staffEn',             msgKey: 'footer.staffBody' },
    legalCompany:     { arField: 'legalCompany',     enField: 'legalCompanyEn',     msgKey: 'footer.legalCompanyBody' },
    legalCancellation:{ arField: 'legalCancellation',enField: 'legalCancellationEn',msgKey: 'footer.legalCancellationBody' },
    dataProtection:   { arField: 'dataProtection',   enField: 'dataProtectionEn',   msgKey: 'footer.dataProtectionBody' },
  };

  const handleOpenContentModal = useCallback((type) => {
    const fields = POLICY_FIELDS[type];
    if (!fields) return;
    const title = t(`footer.${type}Title`);
    const content = getPolicyText(siteSettings, fields.arField, fields.enField, locale, t, fields.msgKey);
    setModalConfig({ isOpen: true, title, content });
  }, [locale, t, siteSettings]);


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

  // Live Global Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [allTripsList, setAllTripsList] = useState([]);

  useEffect(() => {
    import('@/lib/db').then(db => {
      if (db && db.getAllTrips) {
        db.getAllTrips().then(trips => {
          if (trips && Array.isArray(trips)) {
            setAllTripsList(trips);
          }
        }).catch(() => {});
      }
    }).catch(() => {});
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.trim().length < 1) return [];
    const q = searchQuery.trim().toLowerCase();
    const capLocale = locale ? locale.charAt(0).toUpperCase() + locale.slice(1) : 'En';
    
    // 1. Search cities across all supported languages
    const cityMatches = (cities || []).filter(c => 
      (c.name && c.name.toLowerCase().includes(q)) || 
      (c.nameAr && c.nameAr.toLowerCase().includes(q)) || 
      (c.nameEn && c.nameEn.toLowerCase().includes(q)) || 
      (c.slug && c.slug.toLowerCase().includes(q)) ||
      (c.names && Object.values(c.names).some(n => typeof n === 'string' && n.toLowerCase().includes(q)))
    ).map(c => {
      const cityName = c.names?.[locale] || (locale === 'ar' ? c.nameAr : c.name) || c.name;
      return {
        id: `city-${c.slug}`,
        title: cityName,
        type: locale === 'ar' ? '🗺️ وجهة سياحية' : locale === 'de' ? '🗺️ Reiseziel' : locale === 'ru' ? '🗺️ Направление' : '🗺️ Destination',
        url: `/city/${c.slug}`,
        image: c.heroImage || 'https://images.unsplash.com/photo-1572252821143-035a02484666?auto=format&fit=crop&w=400&q=80',
        price: null
      };
    });

    // 2. Search packages across languages
    const packageList = [
      { id: 'pkg-relaxation', titleAr: 'باقات استرخاء استثنائية', titleEn: 'Relaxation Packages', typeAr: '✨ باكج سياحي', typeEn: '✨ Package', url: '/packages#relaxation', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80', price: 299 },
      { id: 'pkg-cultural', titleAr: 'جولات سياحية ثقافية', titleEn: 'Cultural Packages', typeAr: '🏺 باكج سياحي', typeEn: '🏺 Package', url: '/packages#cultural', image: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=400&q=80', price: 349 },
      { id: 'pkg-nile', titleAr: 'باقات كروز النيل الفاخرة', titleEn: 'Nile Cruise Packages', typeAr: '🛳️ كروز النيل', typeEn: '🛳️ Nile Cruise', url: '/packages#nile-cruise', image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=400&q=80', price: 499 }
    ];

    const packageMatches = packageList.filter(p => 
      (p.titleAr && p.titleAr.toLowerCase().includes(q)) || 
      (p.titleEn && p.titleEn.toLowerCase().includes(q))
    ).map(p => ({
      id: p.id,
      title: locale === 'ar' ? p.titleAr : p.titleEn,
      type: locale === 'ar' ? p.typeAr : p.typeEn,
      url: p.url,
      image: p.image,
      price: p.price
    }));

    // 3. Search trips across all 10 language fields
    const tripMatches = (allTripsList || []).filter(t => {
      if (!t || t.deleted || (typeof t.id === 'string' && t.id.startsWith('del_'))) return false;

      const valuesToSearch = [
        t.title,
        t.titleAr,
        t.titleEn,
        t.titleDe,
        t.titleFr,
        t.titleEs,
        t.titleIt,
        t.titleRu,
        t.titleTr,
        t.titleZh,
        t.titleJa,
        ...(t.titles ? Object.values(t.titles) : []),
        t.description,
        t.descriptionAr,
        t.descriptionEn,
        t.tripDescription,
        t.tripDescriptionAr,
        t.tripDescriptionEn,
        t.category,
        t.city,
        t.slug
      ].filter(v => typeof v === 'string' && v.trim().length > 0);

      return valuesToSearch.some(val => val.toLowerCase().includes(q));
    }).map(t => {
      const tripTitle = t[`title${capLocale}`] || t.titles?.[locale] || (locale === 'ar' ? (t.titleAr || t.titleEn) : (t.titleEn || t.titleAr)) || t.title;
      return {
        id: t.id,
        title: tripTitle,
        type: locale === 'ar' ? '✈️ رحلة سياحية' : locale === 'de' ? '✈️ Ausflug' : locale === 'ru' ? '✈️ Экскурсия' : '✈️ Excursion',
        url: (t.slug && t.category) ? `/city/${t.slug}/${t.category}` : `/checkout?tripId=${t.id}&price=${t.price || 50}&titleAr=${encodeURIComponent(t.titleAr || '')}&titleEn=${encodeURIComponent(t.titleEn || '')}`,
        image: t.image || (Array.isArray(t.images) && t.images[0]) || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=400&q=80',
        price: t.price
      };
    });

    return [...cityMatches, ...packageMatches, ...tripMatches].slice(0, 8);
  }, [searchQuery, allTripsList, locale]);

  const handleReviewImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (!dataUrl) return;

      // Immediately set dataUrl so user sees preview right away on mobile
      setReviewForm(prev => ({ ...prev, image: dataUrl }));

      // Try canvas compression to optimize payload size
      try {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 300;
          const MAX_HEIGHT = 300;
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

          const compressed = canvas.toDataURL('image/jpeg', 0.75);
          setReviewForm(prev => ({ ...prev, image: compressed }));
        };
        img.src = dataUrl;
      } catch (err) {
        console.warn('Canvas compression skipped:', err);
      }
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
        {/* Dark Overlay over GlobalBackground */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(11, 11, 11, 0.45)',
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
              <TranslatedText text="ORLUXUS | UNVEIL EXCLUSIVE LUXURY" />
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
              <TranslatedText text="Curated experiences for the discerning traveler, where sophistication meets unparalleled adventure." />
            </p>
            
            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%', maxWidth: '600px' }}>
              <a href="#destinations" className="btn" style={{ 
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
                <TranslatedText text="DISCOVER YOUR JOURNEY" />
              </a>

              {/* 🔍 LUXURY LIVE SEARCH BAR */}
              <div style={{ position: 'relative', width: '100%', zIndex: 100 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(15, 15, 15, 0.85)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid var(--gold-500)',
                  borderRadius: '999px',
                  padding: '6px 12px 6px 20px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
                  transition: 'all 0.3s ease'
                }}>
                  <span style={{ fontSize: '1.2rem', marginRight: locale === 'ar' ? '0' : '10px', marginLeft: locale === 'ar' ? '10px' : '0' }}>🔍</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={locale === 'ar' ? 'ابحث عن أي رحلة، مدينة، كروز، أو تجربة فاخرة...' : 'Search any trip, city, cruise, or experience...'}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: '#FFFFFF',
                      fontSize: '0.95rem',
                      fontFamily: 'inherit',
                      padding: '8px 0'
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-tertiary)',
                        fontSize: '1.1rem',
                        cursor: 'pointer',
                        padding: '0 8px'
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Autocomplete Results Dropdown */}
                {searchResults.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    right: 0,
                    background: 'rgba(18, 18, 18, 0.96)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid var(--border-accent)',
                    borderRadius: '16px',
                    boxShadow: 'var(--shadow-glow-gold)',
                    maxHeight: '380px',
                    overflowY: 'auto',
                    zIndex: 200,
                    textAlign: locale === 'ar' ? 'right' : 'left',
                    padding: '8px'
                  }}>
                    {searchResults.map(item => (
                      <Link
                        key={item.id}
                        href={item.url}
                        onClick={() => setSearchQuery('')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          textDecoration: 'none',
                          color: '#FFFFFF',
                          transition: 'background 0.2s ease',
                          borderBottom: '1px solid rgba(255,255,255,0.05)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(212, 175, 55, 0.12)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--gold-400)' }}>
                            {item.type}
                          </div>
                        </div>
                        {item.price && (
                          <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--emerald-400)', fontFamily: 'var(--font-en)' }}>
                            €{item.price}
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
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
                        src={dynamicCity.image}
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
                    
                    {/* Overlay Tag: Luxury Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: locale === 'ar' ? 'auto' : '12px',
                      left: locale === 'ar' ? '12px' : 'auto',
                      background: 'linear-gradient(135deg, rgba(201,162,39,0.85), rgba(180,140,20,0.9))',
                      backdropFilter: 'blur(8px)',
                      color: '#FFFFFF',
                      padding: '4px 12px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: '700',
                      fontFamily: 'var(--font-title)',
                      zIndex: 2,
                      letterSpacing: '0.5px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    }}>
                      ✦ {locale === 'ar' ? 'وجهة فاخرة' : 'Luxury Destination'}
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
                        {t('common.luxuryDest')}
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

                    {/* Location Pin */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                      <span>📍</span>
                      <span>{t('common.egypt')}</span>
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
                      <span>{t('common.viewDetails')}</span>
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
                {t('concierge.vipSecurity')}
              </h3>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '300px' }}>
                {t('concierge.vipSecurityDesc')}
              </p>
            </div>
          </div>

          {/* Proposal CTA Button */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <a 
              href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(t('common.requestProposalMsg'))}`} 
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
              {t('common.requestProposal')}
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
            {t('common.imagineTitle')}
          </h2>
          <div style={{ marginBottom: '2rem', fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {t('common.imagineDesc')}
          </div>
          <Link href="/our-story" className="btn btn-primary" style={{ padding: '10px 28px', fontSize: '0.95rem', borderRadius: '30px' }}>
            {t('common.readOurStory')}
          </Link>
        </div>
      </section>
      </LazySection>

      {/* 4. CLIENT TESTIMONIALS CTA */}
      <LazySection fallback={<SectionSkeleton height="280px" />}>
      <section style={{ padding: 'var(--space-3xl) 0', background: 'transparent', borderTop: '1px solid var(--border-subtle)', position: 'relative' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto' }}>
          <span style={{ color: 'var(--gold-500)', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block', fontSize: 'var(--font-size-xs)' }}>
            ⭐ {locale === 'ar' ? 'آراء عملائنا' : 'Client Testimonials'}
          </span>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.8rem' }}>
            {t('reviews.subtitle')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.8rem', fontSize: '0.95rem', lineHeight: '1.6' }}>
            {t('reviews.readWrite')}
          </p>
          <Link 
            href="/reviews" 
            className="btn btn-primary" 
            style={{ 
              padding: '12px 36px', 
              fontSize: '0.95rem', 
              fontWeight: '700',
              borderRadius: '30px', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px',
              boxShadow: '0 4px 18px rgba(201, 162, 39, 0.35)'
            }}
          >
            ⭐ {locale === 'ar' ? 'اقرأ آراء عملائنا أو شارك تجربتك' : 'Read Client Reviews & Share Your Experience'}
          </Link>
        </div>
      </section>
      </LazySection>




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
