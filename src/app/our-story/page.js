'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/navigation/Navbar';
import { getMessages, messages } from '@/lib/messages';
import { useLanguage } from '@/context/LanguageContext';
import { getSocialMedia } from '@/lib/db';
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
    ar: 'ORLUXUS هي شركة سياحية متخصصة في تقديم وتنظيم أرقى تجارب السياحة الفاخرة والرحلات البحرية في البحر الأحمر (الغردقة، شرم الشيخ، مرسى علم، والساحل الشمالي). نحرص على تقديم أعلى معايير الجودة والضيافة لضيوفنا الكرام.',
    en: 'ORLUXUS is a premier luxury tourism and travel experiences provider specializing in luxury Red Sea excursions, private yachts, and bespoke tours across Hurghada, Sharm El-Sheikh, Marsa Alam, and the North Coast.'
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

export default function OurStoryPage() {
  const [siteName, setSiteName] = useState('ORLUXUS');
  const [whatsapp, setWhatsapp] = useState('+20100000000');
  const [socialMedia, setSocialMedia] = useState({});
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', content: '' });

  const { locale, t, isReady } = useLanguage();
  const { settings: siteSettings } = useSettings();

  const storyParagraphs = useMemo(() => {
    const msgs = getMessages(locale);
    return msgs.whyChooseUs?.story || messages.en.whyChooseUs.story;
  }, [locale]);

  const storyTitle = useMemo(() => {
    const msgs = getMessages(locale);
    return msgs.whyChooseUs?.storyTitle || messages.en.whyChooseUs.storyTitle;
  }, [locale]);

  const POLICY_FIELDS = {
    vision:            { arField: 'vision',            enField: 'visionEn',            msgKey: 'footer.visionBody' },
    goals:             { arField: 'goals',              enField: 'goalsEn',              msgKey: 'footer.goalsBody' },
    sustainability:    { arField: 'sustainability',    enField: 'sustainabilityEn',    msgKey: 'footer.sustainabilityBody' },
    staff:             { arField: 'staff',              enField: 'staffEn',              msgKey: 'footer.staffBody' },
    legalCompany:      { arField: 'legalCompany',      enField: 'legalCompanyEn',      msgKey: 'footer.legalCompanyBody' },
    legalCancellation: { arField: 'legalCancellation', enField: 'legalCancellationEn', msgKey: 'footer.legalCancellationBody' },
    dataProtection:    { arField: 'dataProtection',    enField: 'dataProtectionEn',    msgKey: 'footer.dataProtectionBody' },
  };

  const handleOpenContentModal = useCallback((type) => {
    const fields = POLICY_FIELDS[type];
    if (!fields) return;
    const title = t(`footer.${type}Title`);
    const content = getPolicyText(siteSettings, fields.arField, fields.enField, locale, t, fields.msgKey);
    setModalConfig({ isOpen: true, title, content });
  }, [locale, t, siteSettings]);


  useEffect(() => {
    const loadData = async () => {
      if (typeof window !== 'undefined') {
        const savedName = localStorage.getItem('orluxus_site_name');
        const savedPhone = localStorage.getItem('orluxus_whatsapp');
        if (savedName) setSiteName(savedName);
        if (savedPhone) setWhatsapp(savedPhone);
        
        try {
          const socialData = await getSocialMedia();
          setSocialMedia(socialData || {});
        } catch (err) {
          console.error('Error loading story page data:', err);
        }
      }
    };
    loadData();
  }, []);

  if (!isReady) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading Story...</div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: 'transparent', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{
        paddingTop: 'calc(var(--nav-height) + 5rem)',
        paddingBottom: '3rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(59, 130, 246, 0.1))',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'relative'
      }}>
        <div className="container">
          <span style={{ color: 'var(--gold-600)', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block', fontSize: 'var(--font-size-sm)' }}>
            {storyTitle}
          </span>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 900,
            color: 'var(--text-primary)',
            lineHeight: 1.2
          }}>
            {t('common.imagineTitle')}
          </h1>
        </div>
      </section>

      {/* Story Content Section */}
      <section style={{ padding: 'var(--space-xl) 0', flex: 1 }}>
        <div className="container" style={{ maxWidth: '850px' }}>
          
          {/* Back Button */}
          <div style={{ marginBottom: '2rem' }}>
            <Link href="/" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--gold-400)',
              textDecoration: 'none',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.gap = '1rem';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.gap = '0.5rem';
            }}>
              <TranslatedText text="← Back to Home" />
            </Link>
          </div>

          <div className="glass-card" style={{
            padding: '3.5rem var(--space-xl)',
            background: 'var(--bg-glass-strong)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '2px solid var(--border-accent)',
            borderRadius: '24px',
            boxShadow: 'var(--shadow-xl), var(--shadow-glow-gold)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Elegant quotes background icon */}
            <div style={{
              position: 'absolute',
              top: '1.5rem',
              left: locale === 'ar' ? 'auto' : '2.5rem',
              right: locale === 'ar' ? '2.5rem' : 'auto',
              fontSize: '10rem',
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
              gap: '1.8rem',
              textAlign: locale === 'ar' ? 'right' : 'left',
              lineHeight: '1.9',
              fontSize: '1.15rem',
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
                    fontWeight: paragraph.includes('ORLUXUS') || paragraph.includes('نحن لا نبيع') || paragraph.includes('don\'t sell') ? '700' : '500'
                  }}
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {/* ─── من نحن / About Section ─── */}
            <div style={{
              marginTop: '2.5rem',
              padding: '2rem',
              background: 'rgba(201,162,39,0.04)',
              border: '1.5px solid rgba(201,162,39,0.3)',
              borderRadius: '16px',
              direction: locale === 'ar' ? 'rtl' : 'ltr',
              textAlign: locale === 'ar' ? 'right' : 'left',
            }}>
              <h3 style={{
                margin: '0 0 1rem 0',
                fontSize: '1.1rem',
                fontWeight: '800',
                color: 'var(--gold-400)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                🏛️ {locale === 'ar' ? 'من نحن — الهوية والخدمات' : 'About Us — Identity & Services'}
              </h3>

              <p style={{ margin: '0 0 1.2rem 0', lineHeight: '1.8', fontSize: '0.97rem', color: 'var(--text-primary)' }}>
                {locale === 'ar'
                  ? 'ORLUXUS هي شركة رائدة في تقديم وتنظيم أرقى الرحلات السياحية الفاخرة والأنشطة البحرية في البحر الأحمر وجمهورية مصر العربية (الغردقة، شرم الشيخ، مرسى علم، والساحل الشمالي). نلتزم بتقديم تجارب استثنائية وفق أعلى معايير الجودة والضيافة العالمية لضيوفنا.'
                  : 'ORLUXUS is a premier luxury tourism and travel experiences provider in Egypt, specializing in luxury Red Sea excursions, private yacht charters, and tailor-made journeys across Hurghada, Sharm El-Sheikh, Marsa Alam, and the North Coast. We are dedicated to delivering world-class hospitality, absolute comfort, and unforgettable experiences.'}
              </p>

              {/* Company Details Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.9rem',
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(201,162,39,0.15)'
              }}>
                {[
                  {
                    icon: '🏢',
                    label: locale === 'ar' ? 'الاسم التجاري' : 'Trade Name',
                    value: 'ORLUXUS MARKETING AND BRANDING'
                  },
                  {
                    icon: '📍',
                    label: locale === 'ar' ? 'العنوان' : 'Address',
                    value: locale === 'ar'
                      ? 'تقسيم النصر، الغردقة 1، محافظة البحر الأحمر'
                      : 'Taksim El-Nasr, Hurghada 1, Red Sea Governorate'
                  },
                  {
                    icon: '📧',
                    label: locale === 'ar' ? 'البريد الإلكتروني' : 'Email',
                    value: 'info@orluxus.com',
                    href: 'mailto:info@orluxus.com'
                  },
                  {
                    icon: '💬',
                    label: locale === 'ar' ? 'واتساب الدعم' : 'WhatsApp Support',
                    value: locale === 'ar' ? 'متوفر عبر الموقع' : 'Available via the website'
                  },
                  {
                    icon: '🌍',
                    label: locale === 'ar' ? 'مناطق الخدمة' : 'Service Areas',
                    value: locale === 'ar'
                      ? 'الغردقة • مرسى علم • شرم الشيخ • الساحل الشمالي'
                      : 'Hurghada • Marsa Alam • Sharm El-Sheikh • North Coast'
                  },
                  {
                    icon: '⭐',
                    label: locale === 'ar' ? 'معايير الخدمة' : 'Service Standards',
                    value: locale === 'ar'
                      ? 'خدمات سياحية فاخرة ومعتمدة 100%'
                      : '100% Certified Luxury Tourism Services',
                    highlight: true
                  }
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    gap: '0.6rem',
                    alignItems: 'flex-start',
                    padding: '0.7rem',
                    background: item.highlight ? 'rgba(201,162,39,0.08)' : 'rgba(255,255,255,0.02)',
                    borderRadius: '10px',
                    border: item.highlight ? '1px solid rgba(201,162,39,0.3)' : '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: '1px' }}>{item.icon}</span>
                    <div>
                      <div style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-tertiary)',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '2px'
                      }}>
                        {item.label}
                      </div>
                      {item.href ? (
                        <a href={item.href} style={{
                          fontSize: '0.85rem',
                          color: 'var(--gold-400)',
                          fontWeight: '600',
                          textDecoration: 'none',
                          fontFamily: 'var(--font-en)'
                        }}>
                          {item.value}
                        </a>
                      ) : (
                        <div style={{
                          fontSize: '0.85rem',
                          color: item.highlight ? 'var(--gold-400)' : 'var(--text-primary)',
                          fontWeight: item.highlight ? '700' : '600',
                          fontFamily: (i === 0 || i === 2) ? 'var(--font-en)' : 'inherit'
                        }}>
                          {item.value}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Signature Divider */}
            <div style={{
              marginTop: '4rem',
              borderTop: '1px solid rgba(251, 191, 36, 0.2)',
              paddingTop: '2.5rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem'
            }}>
              <span style={{
                fontFamily: 'var(--font-en)',
                fontSize: '2rem',
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


      
    </main>
  );
}
