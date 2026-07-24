'use client';

import { useState, useEffect, Suspense } from 'react';
import Navbar from '@/components/navigation/Navbar';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useSearchParams } from 'next/navigation';

const STATUS_COLORS = {
  confirmed: '#10b981', pending: '#f59e0b', cancelled: '#ef4444', completed: '#6366f1',
};
const STATUS_BG = {
  confirmed: '#ecfdf5', pending: '#fef3c7', cancelled: '#fef2f2', completed: '#eef2ff',
};

function BookingConfirmationContent() {
  const { locale, t, isReady } = useLanguage();
  const searchParams = useSearchParams();
  const urlRef = searchParams.get('ref') || '';

  const [refInput, setRefInput] = useState(urlRef);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');

  const isAr = locale === 'ar';

  const lookupRef = async (targetRef) => {
    if (!targetRef) return;
    setLoading(true);
    setError('');
    setBooking(null);
    try {
      const res = await fetch('/api/booking-lookup?ref=' + encodeURIComponent(targetRef));
      const data = await res.json();
      if (!res.ok) { 
        setError(data.error || t('booking.notFound')); 
      } else { 
        setBooking(data); 
      }
    } catch { 
      setError(t('booking.notFound')); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    if (urlRef) {
      setRefInput(urlRef);
      lookupRef(urlRef);
    }
  }, [urlRef]);

  const handleSearch = (e) => {
    e.preventDefault();
    const ref = refInput.trim();
    if (!ref) return;
    lookupRef(ref);
  };

  if (!isReady) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading...</div>
      </main>
    );
  }

  const statusKey = (booking?.status || 'pending').toLowerCase();
  
  const getStatusLabel = (status) => {
    const key = (status || 'pending').toLowerCase();
    if (key === 'confirmed') return t('booking.statusConfirmed');
    if (key === 'pending') return t('booking.statusPending');
    if (key === 'cancelled') return t('booking.statusCancelled');
    if (key === 'completed') return t('booking.statusCompleted');
    return status?.toUpperCase() || '';
  };

  const getPayMethodLabel = (type) => {
    if (type === 'bank_transfer') return t('booking.payBankTransfer');
    if (type === 'onsite') return t('booking.payOnsite');
    if (type === 'card') return 'Dafah Credit Card';
    return type?.toUpperCase() || '—';
  };

  const statusLabel = getStatusLabel(booking?.status);
  const payLabel = getPayMethodLabel(booking?.paymentType);

  const rows = booking ? [
    { label: t('booking.customer'), value: booking.customerName || booking.customer || '—' },
    { label: t('booking.service'), value: booking.service || '—' },
    { label: t('booking.date'), value: booking.date || '—' },
    { label: t('booking.travelers'), value: (booking.travelers || 1) + ' ' + t('booking.persons') },
    { label: t('booking.amount'), value: '€' + (Number(booking.amount || booking.finalAmount || 0) || 0).toFixed(2) },
    { label: t('booking.payStatus'), value: statusLabel },
    { label: t('booking.payMethod'), value: payLabel },
    ...(booking.agentName ? [{ label: t('booking.agent'), value: booking.agentName }] : []),
    ...(booking.pickup ? [{ label: t('booking.pickup'), value: booking.pickup }] : []),
    ...(booking.specialRequests ? [{ label: t('booking.specialRequests'), value: booking.specialRequests, fullWidth: true }] : []),
  ] : [];

  const statusEmoji = { confirmed: '✅', pending: '⏳', cancelled: '❌', completed: '✔️' }[statusKey] || '📋';

  return (
    <main style={{ minHeight: '100vh', paddingBottom: '5rem', background: 'transparent' }}>
      <Navbar />

      <div style={{
        paddingTop: 'calc(var(--nav-height) + 4rem)',
        paddingBottom: '3rem',
        textAlign: 'center',
        background: 'linear-gradient(180deg, rgba(180,83,9,0.06) 0%, transparent 100%)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div className="container animate-fade-in-up" style={{ maxWidth: '680px' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #b45309, #c9a227)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem auto', boxShadow: '0 8px 30px rgba(180,83,9,0.25)',
            fontSize: '2rem',
          }}>🔑</div>
          <h1 className="section-title" style={{ marginBottom: '0.75rem', fontSize: '2.2rem' }}>{t('booking.pageTitle')}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6', maxWidth: '500px', margin: '0 auto' }}>{t('booking.subtitle')}</p>
        </div>
      </div>

      <div className="container animate-fade-in-up" style={{ maxWidth: '680px', paddingTop: '3rem' }}>
        <form onSubmit={handleSearch} style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="text" value={refInput}
              onChange={e => setRefInput(e.target.value)}
              placeholder={t('booking.placeholder')}
              style={{
                flex: 1, minWidth: '200px', padding: '0.9rem 1.2rem',
                borderRadius: '9999px', border: '1.5px solid var(--border-medium)',
                background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                fontSize: '1rem', fontFamily: 'var(--font-en)', outline: 'none',
                textAlign: isAr ? 'right' : 'left',
              }}
              autoComplete="off" spellCheck="false"
            />
            <button type="submit" disabled={loading} className="btn btn-primary"
              style={{ padding: '0.9rem 1.8rem', fontSize: '0.95rem', borderRadius: '9999px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? '⏳' : t('booking.searchBtn')}
            </button>
          </div>
        </form>

        {error && (
          <div className="glass-card animate-fade-in-up" style={{ padding: '1.2rem 1.5rem', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)', borderRadius: '12px', textAlign: 'center', color: '#ef4444', marginBottom: '2rem' }}>
            {error}
          </div>
        )}

        {booking && (
          <>
            <style dangerouslySetInnerHTML={{ __html: `
              @media print {
                @page { size: A4 portrait; margin: 10mm; }
                body { background: #ffffff !important; color: #0f172a !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                .hide-print, nav, footer, button { display: none !important; }
                #confirmation-sheet { border: none !important; box-shadow: none !important; padding: 0 !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; page-break-inside: avoid !important; }
              }
            ` }} />

            <div id="confirmation-sheet" className="glass-card animate-scale-in" style={{
              padding: '2rem 2.5rem', background: '#ffffff', color: '#0f172a',
              borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-xl)',
              maxWidth: '750px', margin: '0 auto'
            }}>
              {/* Invoice Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.2rem', borderBottom: '2px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <img src="/logo_gold.png" alt="Orluxus" style={{ height: '52px', width: 'auto', objectFit: 'contain' }} onError={e => { e.target.style.display = 'none'; }} />
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#d97706', margin: 0, letterSpacing: '2px', fontFamily: 'var(--font-en)' }}>ORLUXUS</h2>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>ORLUXUS TOURISM AGENCY</span>
                  </div>
                </div>
                <div style={{ textAlign: isAr ? 'left' : 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '2px', textTransform: 'uppercase', fontWeight: 'bold' }}>{t('booking.ref')}</div>
                  <div style={{ fontFamily: 'var(--font-en)', fontWeight: '900', fontSize: '1.15rem', color: '#0f172a', letterSpacing: '1px' }}>{booking.ref}</div>
                </div>
              </div>

              {/* Status Header */}
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <span style={{
                  display: 'inline-block', padding: '0.4rem 1.8rem', borderRadius: '9999px',
                  fontWeight: '800', fontSize: '0.95rem', letterSpacing: '1px',
                  color: STATUS_COLORS[statusKey] || '#64748b',
                  background: STATUS_BG[statusKey] || '#f8fafc',
                  border: '1.5px solid ' + (STATUS_COLORS[statusKey] || '#e2e8f0'),
                }}>
                  {statusLabel}
                </span>
              </div>

              {/* Data Table */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.8rem', marginBottom: '1.2rem' }}>
                {rows.map(({ label, value, fullWidth }, i) => (
                  <div key={i} style={{
                    background: fullWidth ? '#fff7ed' : '#f8fafc',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    border: fullWidth ? '1px solid #fed7aa' : '1px solid #e2e8f0',
                    textAlign: isAr ? 'right' : 'left',
                    ...(fullWidth ? { gridColumn: '1 / -1' } : {})
                  }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '3px', fontWeight: 'bold' }}>
                      {label}
                    </div>
                    <div style={{ fontWeight: fullWidth ? '500' : '700', color: '#0f172a', fontSize: '0.92rem', wordBreak: 'break-word', lineHeight: '1.4' }}>{value || '—'}</div>
                  </div>
                ))}
              </div>

              {/* Emergency Contact & Digital Signature Block */}
              <div style={{ border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '1rem 1.2rem', marginBottom: '1.2rem', background: '#ffffff' }}>
                <h4 style={{ margin: '0 0 6px', fontSize: '0.75rem', color: '#d97706', textTransform: 'uppercase', letterSpacing: '1px', textAlign: isAr ? 'right' : 'left', fontWeight: 'bold' }}>
                  {t('booking.termsTitle')}
                </h4>
                <p style={{ margin: '0 0 8px', fontSize: '0.8rem', color: '#0f172a', lineHeight: '1.5', textAlign: isAr ? 'right' : 'left' }}>
                  {t('booking.termsBody', { name: booking.customerName })}
                </p>
                
                <div style={{ background: '#f8fafc', borderRadius: '6px', padding: '8px 12px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '0.8rem', fontSize: '0.75rem', color: '#64748b', border: '1px solid #e2e8f0' }}>
                  <span><strong>{t('booking.digitallyAgreed')}:</strong> {booking.customerName}</span>
                  {booking.createdAt && (
                    <span>
                      <strong>{t('booking.bookingTime')}:</strong>{' '}
                      {(() => {
                        try {
                          const dateObj = booking.createdAt?.seconds ? new Date(booking.createdAt.seconds * 1000) : new Date(booking.createdAt);
                          return isNaN(dateObj.getTime()) ? '—' : dateObj.toLocaleString(isAr ? 'ar-EG' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
                        } catch {
                          return '—';
                        }
                      })()}
                    </span>
                  )}
                  <span><strong>{t('booking.bookingRef')}:</strong> {booking.ref}</span>
                </div>

                {/* Emergency Contact Information (Kept in Invoice) */}
                <div style={{ marginTop: '0.8rem', paddingTop: '0.6rem', borderTop: '1px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#0f172a', fontWeight: '600' }}>
                  <span>24/7 Emergency Support Hotline: +20 15 50507949</span>
                  <span>WhatsApp: +20 15 50507949</span>
                </div>
              </div>

              <div style={{ textAlign: 'center', paddingTop: '0.8rem', borderTop: '1px dashed #e2e8f0', fontSize: '0.78rem', color: '#64748b', fontWeight: 'bold' }}>
                {t('booking.thankYou')}
              </div>
            </div>
          </>
        )}

        {booking && (
          <div className="hide-print" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
            <button onClick={() => window.print()} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.8rem', cursor: 'pointer' }}>
              {t('booking.printBtn')}
            </button>
            <Link href="/" className="btn btn-secondary" style={{ padding: '0.8rem 1.8rem' }}>{t('booking.homeBtn')}</Link>
          </div>
        )}

        {!booking && !error && (
          <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            💡 {t('booking.hint')}
          </div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .hide-print, nav, header, footer, .water-bg-pattern {
            display: none !important;
          }
          #confirmation-sheet {
            box-shadow: none !important;
            border: 1px solid #cbd5e1 !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            padding: 1.5rem !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>
    </main>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Loading booking details...</div>}>
      <BookingConfirmationContent />
    </Suspense>
  );
}
