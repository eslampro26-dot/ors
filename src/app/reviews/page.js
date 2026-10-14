'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/navigation/Navbar';
import { getReviews, addReview, getSocialMedia } from '@/lib/db';
import { useLanguage } from '@/context/LanguageContext';
import { useSettings, getPolicyText } from '@/hooks/useSettings';
import TranslatedText from '@/components/TranslatedText';
import TrustBadges from '@/components/TrustBadges';

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
  const { settings: siteSettings } = useSettings();

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    rating: 0,
    text: '',
    images: [],
    video: ''
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoPreview, setVideoPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      try {
        const dynamicReviews = await getReviews();
        setReviews(dynamicReviews || []);
        const socialData = await getSocialMedia();
        setSocialMedia(socialData || {});
        if (siteSettings?.siteName) setSiteName(siteSettings.siteName);
        if (siteSettings?.whatsapp) setWhatsapp(siteSettings.whatsapp);
      } catch (err) {
        console.error('Error loading reviews data:', err);
      }
    };
    loadData();
  }, [siteSettings]);

  const [uploadingMedia, setUploadingMedia] = useState(false);

  const uploadFileToCloud = async (file) => {
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload-image', { method: 'POST', body: fd });
      if (res.ok) {
        const data = await res.json();
        if (data.url) return data.url;
      }
    } catch (err) {
      console.error('Cloud upload error:', err);
    }
    return null;
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingMedia(true);
    const filesToProcess = files.slice(0, 5);

    for (const file of filesToProcess) {
      const cloudUrl = await uploadFileToCloud(file);
      if (cloudUrl) {
        setImagePreviews(prev => [...prev, cloudUrl]);
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), cloudUrl],
          image: prev.image || cloudUrl
        }));
      } else {
        // Fallback preview
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setImagePreviews(prev => [...prev, reader.result]);
            setFormData(prev => ({
              ...prev,
              images: [...(prev.images || []), reader.result],
              image: prev.image || reader.result
            }));
          }
        };
        reader.readAsDataURL(file);
      }
    }
    setUploadingMedia(false);
  };

  const handleRemoveImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => {
      const updatedImages = (prev.images || []).filter((_, i) => i !== index);
      return {
        ...prev,
        images: updatedImages,
        image: updatedImages[0] || ''
      };
    });
  };

  const handleVideoChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert(locale === 'ar' ? 'حجم مقطع الفيديو يجب ألا يتجاوز 50 ميجابايت!' : 'Video size must not exceed 50MB!');
      return;
    }

    setUploadingMedia(true);
    const cloudUrl = await uploadFileToCloud(file);
    if (cloudUrl) {
      setVideoPreview(cloudUrl);
      setFormData(prev => ({ ...prev, video: cloudUrl }));
    } else {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setVideoPreview(reader.result);
          setFormData(prev => ({ ...prev, video: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    }
    setUploadingMedia(false);
  };

  const handleRemoveVideo = () => {
    setVideoPreview('');
    setFormData(prev => ({ ...prev, video: '' }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.country || !formData.rating || !formData.text) {
      alert(locale === 'ar' ? 'يرجى ملء جميع الحقول وتحديد التقييم!' : 'Please fill all required fields and select a rating!');
      return;
    }

    if (formData.text.trim().length < 3) {
      alert(locale === 'ar' ? 'يرجى كتابة تقييم أطول (3 أحرف على الأقل)' : 'Please write a longer review (at least 3 characters)');
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewPhoto = (formData.images && formData.images[0]) || formData.image || '';
      const payload = {
        name: formData.name,
        country: formData.country,
        rating: formData.rating,
        text: formData.text,
        image: reviewPhoto,
        images: formData.images || [],
        video: formData.video || '',
        verified: true
      };

      // Direct API call to get proper error messages
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || (locale === 'ar' ? '❌ حدث خطأ في إرسال التقييم.' : '❌ Error submitting review.'));
        return;
      }

      if (data && data.id) {
        setReviews([data, ...reviews]);
        setFormData({ name: '', country: '', rating: 0, text: '', image: '', images: [], video: '' });
        setImagePreviews([]);
        setVideoPreview('');
        alert(locale === 'ar' ? '✅ شكراً! تم إضافة تقييمك بنجاح!' : '✅ Thank you! Your review has been submitted successfully!');
      } else {
        alert(locale === 'ar' ? '❌ حدث خطأ في إرسال التقييم. يرجى المحاولة مرة أخرى.' : '❌ Error submitting review. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(locale === 'ar' ? '❌ حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.' : '❌ Connection error. Please try again.');
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
            {locale === 'ar' ? 'تجارب وتقييمات عملائنا 🌟' : 'Guest Reviews & Experiences 🌟'}
          </h1>
          <p style={{
            fontSize: 'var(--font-size-lg)',
            color: 'var(--text-secondary)',
            maxWidth: '650px',
            margin: '0 auto 1.5rem',
            lineHeight: '1.7'
          }}>
            {locale === 'ar'
              ? 'تجارب حقيقية موثقة من ضيوفنا في مصر. شارك تجربتك وانطباعك بالصور أو مقاطع الفيديو!'
              : 'Authentic verified experiences from our guests in Egypt. Share your feedback with photos or short videos!'}
          </p>

          {/* 🛡️ Guarantee Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 24px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1.5px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '30px',
            color: '#10b981',
            fontWeight: '800',
            fontSize: '0.98rem',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.15)'
          }}>
            <span style={{ fontSize: '1.3rem' }}>🛡️</span>
            <span>
              {locale === 'ar'
                ? 'إلغاء مجاني حتى 24 ساعة واسترداد كامل 100%'
                : 'Free Cancellation up to 24h & 100% Full Refund'}
            </span>
          </div>
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
                        background: '#1e293b',
                        color: '#ffffff',
                        caretColor: '#f59e0b',
                        border: '1px solid rgba(201,162,39,0.3)',
                        borderRadius: '6px',
                        outline: 'none',
                        textAlign: 'right',
                        fontSize: 'inherit',
                        boxSizing: 'border-box',
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
                        background: '#1e293b',
                        color: '#ffffff',
                        caretColor: '#f59e0b',
                        border: '1px solid rgba(201,162,39,0.3)',
                        borderRadius: '6px',
                        outline: 'none',
                        textAlign: 'right',
                        fontSize: 'inherit',
                        boxSizing: 'border-box',
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
                        background: '#1e293b',
                        color: '#ffffff',
                        caretColor: '#f59e0b',
                        border: '1px solid rgba(201,162,39,0.3)',
                        borderRadius: '6px',
                        outline: 'none',
                        textAlign: 'right',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        fontSize: 'inherit',
                        boxSizing: 'border-box',
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
                      background: imagePreviews.length > 0 ? 'rgba(251, 191, 36, 0.05)' : 'rgba(255,255,255,0.02)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--gold-400)';
                      e.currentTarget.style.background = 'rgba(251, 191, 36, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-medium)';
                      e.currentTarget.style.background = imagePreviews.length > 0 ? 'rgba(251, 191, 36, 0.05)' : 'rgba(255,255,255,0.02)';
                    }}>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                      />
                      {imagePreviews.length > 0 ? (
                        <div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: '1rem' }}>
                            {imagePreviews.map((preview, index) => (
                              <div key={index} style={{ position: 'relative' }}>
                                <div style={{
                                  width: '80px',
                                  height: '80px',
                                  borderRadius: '8px',
                                  backgroundImage: `url(${preview})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                  border: '2px solid var(--gold-400)',
                                  boxShadow: '0 0 15px rgba(251, 191, 36, 0.2)'
                                }}></div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(index)}
                                  style={{
                                    position: 'absolute',
                                    top: '-8px',
                                    right: '-8px',
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    background: 'rgba(239, 68, 68, 0.9)',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                          <p style={{ color: 'var(--gold-400)', fontSize: '0.9rem' }}>✓ تم تحديد {imagePreviews.length} صور</p>
                          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>اضغط لإضافة المزيد (حد أقصى 5 صور)</p>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📸</div>
                          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>اسحب صور أو اضغط للاختيار</p>
                          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>JPG, PNG - أقل من 5MB (حد أقصى 5 صور)</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Video Upload (Optional) */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                      🎬 {locale === 'ar' ? 'أضف مقطع فيديو قصير (اختياري)' : 'Add Short Video (Optional)'}
                    </label>
                    <div style={{
                      position: 'relative',
                      border: '2px dashed var(--border-medium)',
                      borderRadius: '6px',
                      padding: '1.5rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      background: videoPreview ? 'rgba(251, 191, 36, 0.05)' : 'rgba(255,255,255,0.02)'
                    }}>
                      {videoPreview ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                          <video
                            src={videoPreview}
                            controls
                            style={{
                              maxWidth: '100%',
                              maxHeight: '180px',
                              borderRadius: '8px',
                              border: '1px solid var(--gold-400)'
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleRemoveVideo}
                            style={{
                              padding: '6px 14px',
                              borderRadius: '20px',
                              background: 'rgba(239, 68, 68, 0.2)',
                              border: '1px solid rgba(239, 68, 68, 0.5)',
                              color: '#ef4444',
                              cursor: 'pointer',
                              fontSize: '0.82rem',
                              fontWeight: 'bold'
                            }}
                          >
                            🗑️ {locale === 'ar' ? 'حذف مقطع الفيديو' : 'Remove Video'}
                          </button>
                        </div>
                      ) : (
                        <div>
                          <input
                            type="file"
                            accept="video/mp4,video/webm,video/quicktime"
                            onChange={handleVideoChange}
                            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                          />
                          <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>🎥</div>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                            {locale === 'ar' ? 'اضغط لرفع فيديو قصير من تجربتك' : 'Click to upload a short experience video'}
                          </p>
                          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>MP4, WebM — Max 25MB</p>
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
                    {isSubmitting ? (locale === 'ar' ? '⏳ جاري الإرسال...' : '⏳ Submitting...') : (locale === 'ar' ? '📤 إرسال التقييم' : '📤 Submit Review')}
                  </button>
                </form>
              </div>
            </div>

            {/* Reviews Display Section */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                  {t('reviews.title')}
                </h2>
                <span style={{
                  fontSize: '0.85rem',
                  color: 'var(--gold-400)',
                  background: 'rgba(201, 162, 39, 0.1)',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  border: '1px solid rgba(201, 162, 39, 0.25)',
                  fontWeight: '700'
                }}>
                  ⭐ 5.0 · {reviews.length} {locale === 'ar' ? 'تقييم' : 'Reviews'}
                </span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', maxHeight: '700px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {reviews && reviews.length > 0 ? (
                  reviews.map((review, idx) => (
                    <div key={review.id || idx} className="glass-card" style={{
                      padding: '1.5rem',
                      background: 'var(--bg-primary)',
                      border: '1px solid rgba(251, 191, 36, 0.15)',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}>
                      {/* Video Player if present */}
                      {review.video && (
                        <div style={{ marginBottom: '1rem', borderRadius: '8px', overflow: 'hidden', background: '#000' }}>
                          <video
                            src={review.video}
                            controls
                            style={{ width: '100%', maxHeight: '240px', objectFit: 'contain' }}
                          />
                        </div>
                      )}

                      {/* Images Gallery */}
                      {review.images && review.images.length > 0 ? (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: review.images.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(100px, 1fr))',
                          gap: '6px',
                          marginBottom: '1rem'
                        }}>
                          {review.images.map((img, imgIdx) => (
                            <div
                              key={imgIdx}
                              style={{
                                height: review.images.length === 1 ? '180px' : '90px',
                                borderRadius: '6px',
                                backgroundImage: `url(${img})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                border: '1px solid var(--border-subtle)'
                              }}
                            />
                          ))}
                        </div>
                      ) : review.image ? (
                        <div style={{
                          width: '100%',
                          height: '160px',
                          borderRadius: '8px',
                          backgroundImage: `url(${review.image})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          marginBottom: '1rem',
                          border: '1px solid var(--border-subtle)'
                        }} />
                      ) : null}
                      
                      {/* Review Content */}
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '0.9rem' }}>
                        &quot;{review.text}&quot;
                      </p>

                      {/* Footer */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.8rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <h4 style={{ fontSize: '0.92rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>
                              {review.name}
                            </h4>
                            <span style={{ fontSize: '0.72rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '10px' }}>
                              ✓ {locale === 'ar' ? 'موثق' : 'Verified'}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                            {review.country} {review.date ? `· ${review.date}` : ''}
                          </span>
                        </div>
                        <div style={{ color: 'var(--gold-400)', fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
                          {'★'.repeat(Math.max(1, review.rating || 0))}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</p>
                    <p>{t('reviews.noReviews')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <TrustBadges variant="default" showTitle={false} />


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
