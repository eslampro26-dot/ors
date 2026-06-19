'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/navigation/Navbar';
import { getReviews, addReview } from '@/lib/db';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [siteName, setSiteName] = useState('ORLUXUS');
  
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

  useEffect(() => {
    const loadData = async () => {
      if (typeof window !== 'undefined') {
        const savedName = localStorage.getItem('orluxus_site_name');
        if (savedName) setSiteName(savedName);
        
        try {
          const dynamicReviews = await getReviews();
          setReviews(dynamicReviews || []);
        } catch (err) {
          console.error('Error loading reviews:', err);
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
    <main style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
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

      {/* Footer */}
      <footer style={{
        background: '#090d16',
        color: '#ffffff',
        padding: '2rem 0',
        borderTop: '1px solid rgba(251, 191, 36, 0.2)',
        marginTop: 'auto',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'rgba(255,255,255,0.5)'
      }}>
        <div className="container">
          © {new Date().getFullYear()} {siteName} - Thank you for your valuable feedback!
        </div>
      </footer>

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
