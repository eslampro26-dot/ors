'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * ServiceReviews Component
 * Displays reviews for a specific trip/service.
 * Shows a Google Business Review button (from admin settings) for verified Google reviews,
 * plus a simple name-based form for quick internal reviews.
 *
 * @param {string} serviceId - The trip/service ID
 * @param {string} locale - Current language locale
 */
export default function ServiceReviews({ serviceId, locale }) {
  const isAr = locale === 'ar';

  // Google Business Review link from admin settings
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');

  // Reviews list states
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [userExistingReview, setUserExistingReview] = useState(null);

  // Anonymous user identity (stored in localStorage)
  const [anonUser, setAnonUser] = useState(null); // { uid, displayName }

  // Form states
  const [typedName, setTypedName] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // ─── Load anonymous identity from localStorage on mount ───
  useEffect(() => {
    try {
      const saved = localStorage.getItem('orluxus_review_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.uid && parsed.displayName) {
          setAnonUser(parsed);
          setTypedName(parsed.displayName);
        }
      }
    } catch (e) {
      console.warn('Failed to load local review user:', e);
    }
  }, []);

  // ─── Fetch Google Review URL from admin settings ───
  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.googleReviewUrl) setGoogleReviewUrl(data.googleReviewUrl);
      })
      .catch(() => {});
  }, []);

  // ─── Fetch reviews ───
  const fetchReviews = useCallback(async () => {
    if (!serviceId) return;
    setReviewsLoading(true);
    try {
      const res = await fetch(`/api/feedback?serviceId=${encodeURIComponent(serviceId)}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data || []);
      }
    } catch (e) {
      console.error('Error fetching service reviews:', e);
    } finally {
      setReviewsLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // ─── Find user's existing review ───
  useEffect(() => {
    if (anonUser && reviews.length > 0) {
      const found = reviews.find(r => r.userId === anonUser.uid);
      setUserExistingReview(found || null);
    } else {
      setUserExistingReview(null);
    }
  }, [anonUser, reviews]);

  // ─── Clear Identity ───
  const handleSignOut = () => {
    localStorage.removeItem('orluxus_review_user');
    setAnonUser(null);
    setTypedName('');
    setSelectedRating(0);
    setComment('');
    setSubmitSuccess(false);
    setIsEditing(false);
    setSubmitError('');
  };

  // ─── Start editing existing review ───
  const handleEditReview = () => {
    if (userExistingReview) {
      setSelectedRating(userExistingReview.rating);
      setComment(userExistingReview.comment);
      if (anonUser) setTypedName(anonUser.displayName);
      setIsEditing(true);
      setSubmitSuccess(false);
      setSubmitError('');
    }
  };

  // ─── Submit review ───
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    // Anonymous user typing name
    const name = typedName.trim();
    if (!name) {
      setSubmitError(isAr ? 'الرجاء إدخال اسمك الكريم.' : 'Please enter your name.');
      return;
    }
    if (name.length < 3) {
      setSubmitError(isAr ? 'الاسم يجب أن يكون 3 أحرف على الأقل.' : 'Name must be at least 3 characters.');
      return;
    }

    let finalName = name;
    let finalUid = '';
    let finalPhoto = '';
    let finalEmail = '';

    // If we already have a generated anonymous user ID, use it. Otherwise generate a new one.
    if (anonUser && anonUser.displayName === name) {
      finalUid = anonUser.uid;
    } else {
      const randId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      finalUid = randId;
      const newAnon = { uid: randId, displayName: name };
      localStorage.setItem('orluxus_review_user', JSON.stringify(newAnon));
      setAnonUser(newAnon);
    }

    if (!selectedRating) {
      setSubmitError(isAr ? 'الرجاء اختيار التقييم بالنجوم.' : 'Please select a star rating.');
      return;
    }
    if (!comment.trim() || comment.trim().length < 5) {
      setSubmitError(isAr ? 'الرجاء كتابة تعليق (5 أحرف على الأقل).' : 'Please write a comment (min 5 chars).');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId,
          userId: finalUid,
          userName: finalName,
          userPhoto: finalPhoto,
          userEmail: finalEmail,
          rating: selectedRating,
          comment: comment.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || (isAr ? 'حدث خطأ أثناء حفظ التقييم.' : 'An error occurred.'));
      } else {
        setSubmitSuccess(true);
        setIsEditing(false);
        await fetchReviews();
        setSelectedRating(0);
        setComment('');
      }
    } catch (e) {
      setSubmitError(isAr ? 'حدث خطأ في الاتصال' : 'Connection error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Average rating ───
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  // ─── Star renderer ───
  const renderStars = (rating, size = '1rem', color = '#f59e0b') => (
    <span style={{ display: 'inline-flex', gap: '1px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= rating ? color : '#d1d5db', fontSize: size, lineHeight: 1 }}>★</span>
      ))}
    </span>
  );

  // ─── Interactive star selector ───
  const renderStarSelector = () => (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '0.75rem' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => setSelectedRating(i)}
          onMouseEnter={() => setHoverRating(i)}
          onMouseLeave={() => setHoverRating(0)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px',
            fontSize: '2rem',
            color: i <= (hoverRating || selectedRating) ? '#f59e0b' : '#d1d5db',
            transition: 'color 0.15s ease, transform 0.1s ease',
            transform: i <= (hoverRating || selectedRating) ? 'scale(1.15)' : 'scale(1)',
            lineHeight: 1,
          }}
          aria-label={`${i} star${i > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        marginTop: '2rem',
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: '1.5rem',
      }}
    >
      {/* ── Section Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
          ⭐ {isAr ? 'تقييمات العملاء' : 'Customer Reviews'}
          {reviews.length > 0 && (
            <span style={{ marginInlineStart: '8px', fontSize: '0.8rem', fontWeight: '600', color: 'var(--gold-500)' }}>
              ({avgRating} / 5 — {reviews.length} {isAr ? 'تقييم' : 'reviews'})
            </span>
          )}
        </h4>

      {/* ── Identity Indicator / Change Name ── */}
        {anonUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--gold-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: '700', fontSize: '0.85rem', flexShrink: 0 }}>
              {anonUser.displayName[0].toUpperCase()}
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {anonUser.displayName}
            </span>
            <button
              onClick={handleSignOut}
              style={{
                background: 'none',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '3px 8px',
                fontSize: '0.7rem',
                color: 'var(--text-tertiary)',
                cursor: 'pointer',
              }}
            >
              {isAr ? 'تغيير الاسم' : 'Change Name'}
            </button>
          </div>
        )}
      </div>

      {/* ── Google Business Review Banner ── */}
      {googleReviewUrl && (
        <a
          href={googleReviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'linear-gradient(135deg, rgba(66,133,244,0.08), rgba(52,168,83,0.06))',
            border: '1px solid rgba(66,133,244,0.25)',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(66,133,244,0.5)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(66,133,244,0.25)'}
        >
          {/* Google Logo */}
          <svg width="28" height="28" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '800', fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: '2px' }}>
              {isAr ? '⭐ قيّمنا على Google' : '⭐ Review us on Google'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {isAr
                ? 'سيتم توجيهك لصفحة Google لكتابة تقييمك بحسابك الشخصي'
                : 'You will be redirected to Google to write a review with your account'}
            </div>
          </div>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      )}

      {/* ── Review Form (only if no review yet OR editing) ── */}
      {(!userExistingReview || isEditing) && !submitSuccess && (
        <form
          onSubmit={handleSubmit}
          style={{
            background: 'rgba(201,162,39,0.04)',
            border: '1px solid rgba(201,162,39,0.25)',
            borderRadius: '12px',
            padding: '1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            {isEditing
              ? (isAr ? '✏️ تعديل تقييمك' : '✏️ Edit your review')
              : (isAr ? '✍️ أضف تقييمك' : '✍️ Add your review')}
          </p>

          {/* Name Input Field */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              👤 {isAr ? 'الاسم الكريم:' : 'Your Name:'}
              </label>
              <input
                type="text"
                value={typedName}
                onChange={e => setTypedName(e.target.value)}
                placeholder={isAr ? 'اكتب اسمك هنا...' : 'Enter your name...'}
                maxLength={50}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-medium)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.2s ease',
                }}
                 onFocus={e => e.target.style.borderColor = 'var(--gold-400)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-medium)'}
              />
            </div>

          {/* Star selector */}
          <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
            ⭐ {isAr ? 'تقييمك (من 5 نجوم):' : 'Your rating (out of 5):'}
          </label>
          {renderStarSelector()}

          {/* Comment textarea */}
          <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', marginTop: '0.5rem' }}>
            💬 {isAr ? 'تعليقك:' : 'Your comment:'}
          </label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder={isAr ? 'شاركنا تجربتك مع هذه الخدمة...' : 'Share your experience with this service...'}
            rows={3}
            maxLength={1000}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-medium)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '0.88rem',
              resize: 'vertical',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'border-color 0.2s ease',
              minHeight: '80px',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--gold-400)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-medium)'}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* Direct error message */}
            {submitError && (
              <span style={{ color: '#dc2626', fontSize: '0.78rem', flex: 1 }}>⚠️ {submitError}</span>
            )}
            
            <div style={{ display: 'flex', gap: '0.5rem', marginInlineStart: 'auto', alignItems: 'center' }}>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => { setIsEditing(false); setSelectedRating(0); setComment(''); }}
                  style={{ background: 'none', border: '1px solid var(--border-medium)', borderRadius: '8px', padding: '8px 16px', fontSize: '0.82rem', cursor: 'pointer', color: 'var(--text-secondary)' }}
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              )}
              
              <button
                type="submit"
                disabled={submitting || !selectedRating || comment.trim().length < 5 || !typedName.trim()}
                style={{
                  background: selectedRating && comment.trim().length >= 5 && typedName.trim() ? 'var(--gold-500)' : 'var(--border-medium)',
                  color: selectedRating && comment.trim().length >= 5 && typedName.trim() ? '#000' : 'var(--text-tertiary)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 20px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  cursor: selectedRating && comment.trim().length >= 5 && typedName.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting
                  ? (isAr ? 'جاري الإرسال...' : 'Submitting...')
                  : (isEditing ? (isAr ? '💾 حفظ التعديل' : '💾 Save changes') : (isAr ? '📤 إرسال التقييم' : '📤 Submit Review'))}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ── Success message ── */}
      {submitSuccess && (
        <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '0.9rem 1.2rem', marginBottom: '1.5rem', color: '#065f46', fontSize: '0.88rem', fontWeight: '600' }}>
          ✅ {isAr ? 'تم إرسال تقييمك بنجاح! شكراً لك.' : 'Your review was submitted successfully! Thank you.'}
        </div>
      )}

      {/* ── User's existing review (if not editing) ── */}
      {userExistingReview && !isEditing && (
        <div style={{ background: 'rgba(201,162,39,0.06)', border: '1px solid rgba(201,162,39,0.3)', borderRadius: '10px', padding: '0.9rem 1.2rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {renderStars(userExistingReview.rating, '1rem')}
              <span style={{ fontSize: '0.75rem', background: 'rgba(16,185,129,0.1)', color: '#065f46', padding: '2px 7px', borderRadius: '999px', fontWeight: '700' }}>
                ✓ {isAr ? 'تقييمك' : 'Your review'}
              </span>
            </div>
            <button
              onClick={handleEditReview}
              style={{ background: 'none', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '3px 10px', fontSize: '0.72rem', color: 'var(--gold-500)', cursor: 'pointer', fontWeight: '600' }}
            >
              ✏️ {isAr ? 'تعديل' : 'Edit'}
            </button>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{userExistingReview.comment}</p>
        </div>
      )}

      {/* ── Reviews List ── */}
      {reviewsLoading ? (
        <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
          {isAr ? 'جاري تحميل التقييمات...' : 'Loading reviews...'}
        </div>
      ) : reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '1.5rem 1rem', color: 'var(--text-tertiary)', fontSize: '0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px dashed var(--border-subtle)' }}>
          {isAr ? 'لا توجد تقييمات بعد — كن أول من يقيّم هذه الخدمة!' : 'No reviews yet — be the first to review this service!'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reviews
            .filter(r => r.userId !== (googleUser?.uid || anonUser?.uid)) // hide user's own review from list (shown above)
            .map((review) => (
              <div
                key={review.id}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '1rem 1.2rem',
                  transition: 'border-color 0.2s ease',
                }}
              >
                {/* Review header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                  {/* User avatar */}
                  {review.userPhoto ? (
                    <img
                      src={review.userPhoto}
                      alt={review.userName}
                      width={36}
                      height={36}
                      referrerPolicy="no-referrer"
                      style={{ borderRadius: '50%', flexShrink: 0, border: '1px solid var(--border-subtle)' }}
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gold-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#000', fontWeight: '700', fontSize: '1rem' }}>
                      {(review.userName || 'A')[0].toUpperCase()}
                    </div>
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {review.userName || 'Anonymous'}
                      </span>
                      {review.verified && (
                        <span style={{ fontSize: '0.7rem', background: 'rgba(16,185,129,0.1)', color: '#065f46', padding: '1px 6px', borderRadius: '999px', fontWeight: '700', flexShrink: 0 }}>
                          ✓ {isAr ? 'موثّق' : 'Verified'}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      {renderStars(review.rating, '0.85rem')}
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                        {review.date || ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Comment */}
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {review.comment}
                </p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
