'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/navigation/Navbar';
import { getReviews, addReview, getSocialMedia } from '@/lib/db';
import { useLanguage } from '@/context/LanguageContext';

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

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [siteName, setSiteName] = useState('ORLUXUS');
  const [whatsapp, setWhatsapp] = useState('+20100000000');
  const [socialMedia, setSocialMedia] = useState({});
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', content: '' });

  const { locale, t, isReady } = useLanguage();

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    rating: 0,
    text: '',
    image: null
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  useEffect(() => {
    const loadData = async () => {
      if (typeof window !== 'undefined') {
        const savedName = localStorage.getItem('orluxus_site_name');
        const savedPhone = localStorage.getItem('orluxus_whatsapp');
        if (savedName) setSiteName(savedName);
        if (savedPhone) setWhatsapp(savedPhone);
        
        try {
          const dynamicReviews = await getReviews();
          setReviews(dynamicReviews || []);

          const socialData = await getSocialMedia();
          setSocialMedia(socialData || {});
        } catch (err) {
          console.error('Error loading reviews data:', err);
        }
      }
    };
    loadData();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        // Store base64 image in form data
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.country || !formData.rating || !formData.text) {
      alert('يرجى ملء جميع الحقول وتحديد التقييم!');
      return;
    }

    setIsSubmitting(true);

    try {
      const newReview = await addReview({
        name: formData.name,
        country: formData.country,
        rating: formData.rating,
        text: formData.text,
        image: formData.image // Base64 encoded image
      });

      if (newReview) {
        setReviews([newReview, ...reviews]);
        setFormData({
          name: '',
          country: '',
          rating: 0,
          text: '',
          image: null
        });
        setImagePreview(null);
        alert('✅ شكراً! تم إضافة تقييمك بنجاح!');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('❌ حدث خطأ في إرسال التقييم. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: 'transparent', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'var(--space-3xl) var(--space-xl)',
        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(59, 130, 246, 0.1))',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '400px',
          height: '400px',
          background: 'var(--gold-500)',
          filter: 'blur(150px)',
          opacity: 0.08,
          borderRadius: '50%',
          zIndex: 0
        }}></div>

        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <span style={{ color: 'var(--gold-600)', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block', fontSize: 'var(--font-size-sm)' }}>
            Your Experience Matters
          </span>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 900,
            color: 'var(--text-primary)',
            lineHeight: 1.2,
            marginBottom: '1.5rem'
          }}>
            شارك تجربتك معنا 🌟
          </h1>
          <p style={{
            fontSize: 'var(--font-size-lg)',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            رأيك يساعد عملاءنا الآخرين على اختيار التجارب المثالية. شارك صورك وتقييمك الآن!
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section style={{ padding: 'var(--space-4xl) 0', background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)', alignItems: 'start', maxWidth: '1100px', margin: '0 auto' }}>
            
            {/* Form Section */}
            <div>
              <div className="glass-card" style={{
                padding: '2.5rem',
                background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.08), rgba(59, 130, 246, 0.08))',
                border: '2px solid rgba(251, 191, 36, 0.2)',
                borderRadius: '12px'
              }}>
                <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 'bold' }}>
                  ✍️ اكتب تقييمك
                </h2>
                
                <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  {/* Name Input */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                      👤 الاسم
                    </label>
                    <input
                      type="text"
                      placeholder="أدخل اسمك"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        background: 'rgba(255,255,255,0.04)',
                        color: 'white',
                        border: '1px solid var(--border-medium)',
                        borderRadius: '6px',
                        outline: 'none',
                        textAlign: 'right',
                        fontSize: 'inherit'
                      }}
                    />
                  </div>

                  {/* Country Input */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                      🌍 الدولة / الجنسية
                    </label>
                    <input
                      type="text"
                      placeholder="مصر، أمريكا، فرنسا..."
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        background: 'rgba(255,255,255,0.04)',
                        color: 'white',
                        border: '1px solid var(--border-medium)',
                        borderRadius: '6px',
                        outline: 'none',
                        textAlign: 'right',
                        fontSize: 'inherit'
                      }}
                    />
                  </div>

                  {/* Rating Stars */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                      ⭐ التقييم (1-5 نجوم)
                    </label>
                    <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData({ ...formData, rating: star })}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '2.8rem',
                            cursor: 'pointer',
                            opacity: (hoverRating || formData.rating) >= star ? 1 : 0.25,
                            filter: (hoverRating || formData.rating) >= star ? 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.8))' : 'none',
                            transition: 'all 0.2s ease',
                            transform: (hoverRating || formData.rating) >= star ? 'scale(1.1)' : 'scale(1)'
                          }}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Review Text */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                      📝 تقييمك وانطباعك
                    </label>
                    <textarea
                      placeholder="شارك تجربتك مع خدماتنا... ماذا أعجبك؟ هل لديك أي ملاحظات؟"
                      value={formData.text}
                      onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                      rows="5"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        background: 'rgba(255,255,255,0.04)',
                        color: 'white',
                        border: '1px solid var(--border-medium)',
                        borderRadius: '6px',
                        outline: 'none',
                        textAlign: 'right',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        fontSize: 'inherit'
                      }}
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                      📷 أضف صورة (اختياري)
                    </label>
                    <div style={{
                      position: 'relative',
                      border: '2px dashed var(--border-medium)',
                      borderRadius: '6px',
                      padding: '2rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      background: imagePreview ? 'rgba(251, 191, 36, 0.05)' : 'rgba(255,255,255,0.02)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--gold-400)';
                      e.currentTarget.style.background = 'rgba(251, 191, 36, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-medium)';
                      e.currentTarget.style.background = imagePreview ? 'rgba(251, 191, 36, 0.05)' : 'rgba(255,255,255,0.02)';
                    }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                      />
                      {imagePreview ? (
                        <div>
                          <div style={{
                            width: '120px',
                            height: '120px',
                            margin: '0 auto 1rem',
                            borderRadius: '8px',
                            backgroundImage: `url(${imagePreview})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            border: '2px solid var(--gold-400)',
                            boxShadow: '0 0 20px rgba(251, 191, 36, 0.3)'
                          }}></div>
                          <p style={{ color: 'var(--gold-400)', fontSize: '0.9rem' }}>✓ تم تحديد الصورة</p>
                          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>اضغط لتغيير الصورة</p>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📸</div>
                          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>اسحب صورة أو اضغط للاختيار</p>
                          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>JPG, PNG - أقل من 5MB</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      padding: '14px',
                      background: isSubmitting ? 'rgba(251, 191, 36, 0.3)' : 'linear-gradient(135deg, var(--gold-600), var(--gold-400))',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(251, 191, 36, 0.3)',
                      opacity: isSubmitting ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(251, 191, 36, 0.5)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubmitting) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 15px rgba(251, 191, 36, 0.3)';
                      }
                    }}
                  >
                    {isSubmitting ? '⏳ جاري الإرسال...' : '📤 إرسال التقييم'}
                  </button>
                </form>
              </div>
            </div>

            {/* Reviews Display Section */}
            <div>
              <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 'bold' }}>
                💬 آراء العملاء
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', maxHeight: '600px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {reviews && reviews.length > 0 ? (
                  reviews.map((review, idx) => (
                    <div key={review.id || idx} className="glass-card" style={{
                      padding: '1.5rem',
                      background: 'var(--bg-primary)',
                      border: '1px solid rgba(251, 191, 36, 0.1)',
                      borderRadius: '8px'
                    }}>
                      {/* Image */}
                      {review.image && (
                        <div style={{
                          width: '100%',
                          height: '150px',
                          borderRadius: '6px',
                          backgroundImage: `url(${review.image})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          marginBottom: '1rem',
                          border: '1px solid var(--border-subtle)'
                        }}></div>
                      )}
                      
                      {/* Review Content */}
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '0.8rem' }}>
                        &quot;{review.text}&quot;
                      </p>

                      {/* Footer */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.8rem' }}>
                        <div>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                            {review.name}
                          </h4>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                            {review.country}
                          </span>
                        </div>
                        <div style={{ color: 'var(--gold-400)', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                          {'★'.repeat(Math.max(1, review.rating || 0))}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</p>
                    <p>لا توجد تقييمات حالياً. كن الأول!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Back Button */}
      <div style={{ padding: 'var(--space-xl) 0' }}>
        <div className="container">
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
            ← العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>

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

      {/* Scrollbar Styling */}
      <style jsx global>{`
        div::-webkit-scrollbar {
          width: 6px;
        }
        div::-webkit-scrollbar-track {
          background: transparent;
        }
        div::-webkit-scrollbar-thumb {
          background: rgba(251, 191, 36, 0.3);
          border-radius: 3px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: rgba(251, 191, 36, 0.5);
        }
      `}</style>
    </main>
  );
}
