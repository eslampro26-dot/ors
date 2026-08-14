'use client';

import { useState, useEffect, useCallback } from 'react';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

/**
 * ServiceReviews Component
 * Displays verified reviews for a specific trip/service.
 * Allows authenticated (Google) users to submit their own review.
 *
 * @param {string} serviceId - The trip/service ID
 * @param {string} locale - Current language locale
 */
export default function ServiceReviews({ serviceId, locale }) {
  const isAr = locale === 'ar';

  // Auth state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [userExistingReview, setUserExistingReview] = useState(null);

  // Form state
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // ─── Firebase Auth listener ───
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ─── Fetch reviews ───
  const fetchReviews = useCallback(async () => {
    if (!serviceId) return;
    setReviewsLoading(true);
    try {
      const res = await fetch(`/api/service-reviews?serviceId=${encodeURIComponent(serviceId)}`);
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
    if (user && reviews.length > 0) {
      const existing = reviews.find(r => r.userId === user.uid);
      setUserExistingReview(existing || null);
    } else {
      setUserExistingReview(null);
    }
  }, [user, reviews]);

  // ─── Google Sign-In ───
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error('Google sign-in error:', e);
    }
  };

  // ─── Sign Out ───
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setSelectedRating(0);
      setComment('');
      setSubmitSuccess(false);
      setIsEditing(false);
    } catch (e) {
      console.error('Sign-out error:', e);
    }
  };

  // ─── Start editing existing review ───
  const handleEditReview = () => {
    if (userExistingReview) {
      setSelectedRating(userExistingReview.rating);
      setComment(userExistingReview.comment);
      setIsEditing(true);
      setSubmitSuccess(false);
      setSubmitError('');
    }
  };

  // ─── Submit review ───
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !selectedRating || !comment.trim()) return;
    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/service-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId,
          userId: user.uid,
          userName: user.displayName || 'Anonymous',
          userPhoto: user.photoURL || '',
          userEmail: user.email || '',
          rating: selectedRating,
          comment: comment.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || (isAr ? 'حدث خطأ' : 'An error occurred'));
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
    <div style={{ display: 'flex', gap: '6px', marginBottom: '0.75rem' }}>
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

        {/* Auth button */}
        {!authLoading && (
          user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  width={28}
                  height={28}
                  style={{ borderRadius: '50%', border: '1px solid var(--gold-400)' }}
                  referrerPolicy="no-referrer"
                />
              )}
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.displayName}
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
                {isAr ? 'خروج' : 'Sign out'}
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleSignIn}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#fff',
                border: '1px solid #dadce0',
                borderRadius: '8px',
                padding: '7px 14px',
                fontSize: '0.82rem',
                fontWeight: '600',
                color: '#3c4043',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'box-shadow 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.18)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'}
            >
              {/* Google SVG logo */}
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isAr ? 'سجّل الدخول بـ Google للتقييم' : 'Sign in with Google to Review'}
            </button>
          )
        )}
      </div>

      {/* ── Review Form (only if logged in and no review yet OR editing) ── */}
      {user && (!userExistingReview || isEditing) && !submitSuccess && (
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

          {/* Star selector */}
          <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
            {isAr ? 'تقييمك (من 5 نجوم):' : 'Your rating (out of 5):'}
          </label>
          {renderStarSelector()}

          {/* Comment textarea */}
          <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', marginTop: '0.5rem' }}>
            {isAr ? 'تعليقك:' : 'Your comment:'}
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
            {submitError && (
              <span style={{ color: '#dc2626', fontSize: '0.78rem', flex: 1 }}>⚠️ {submitError}</span>
            )}
            <div style={{ display: 'flex', gap: '0.5rem', marginInlineStart: 'auto' }}>
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
                disabled={submitting || !selectedRating || comment.trim().length < 5}
                style={{
                  background: selectedRating && comment.trim().length >= 5 ? 'var(--gold-500)' : 'var(--border-medium)',
                  color: selectedRating && comment.trim().length >= 5 ? '#000' : 'var(--text-tertiary)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 20px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  cursor: selectedRating && comment.trim().length >= 5 ? 'pointer' : 'not-allowed',
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
      {user && userExistingReview && !isEditing && (
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
            .filter(r => !user || r.userId !== user.uid) // hide user's own review from list (shown above)
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
