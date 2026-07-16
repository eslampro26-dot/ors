'use client';

import { useState } from 'react';
import Navbar from '@/components/navigation/Navbar';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

const STATUS_COLORS = {
  confirmed: '#10b981', pending: '#f59e0b', cancelled: '#ef4444', completed: '#6366f1',
};
const STATUS_BG = {
  confirmed: '#ecfdf5', pending: '#fef3c7', cancelled: '#fef2f2', completed: '#eef2ff',
};

export default function BookingConfirmationPage() {
  const { locale, t, isReady } = useLanguage();
  const [refInput, setRefInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');

  const isAr = locale === 'ar';

  const handleSearch = async (e) => {
    e.preventDefault();
    const ref = refInput.trim();
    if (!ref) return;
    setLoading(true);
    setError('');
    setBooking(null);
    try {
      const res = await fetch('/api/booking-lookup?ref=' + encodeURIComponent(ref));
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
    { label: t('booking.customer'), value: booking.customerName },
    { label: t('booking.service'), value: booking.service },
    { label: t('booking.date'), value: booking.date },
    { label: t('booking.travelers'), value: booking.travelers + ' ' + t('booking.persons') },
    { label: t('booking.amount'), value: '€' + Number(booking.amount).toFixed(2) },
    { label: t('booking.payStatus'), value: statusLabel },
    { label: t('booking.payMethod'), value: payLabel },
    ...(booking.agentName ? [{ label: t('booking.agent'), value: booking.agentName }] : []),
    ...(booking.pickup ? [{ label: t('booking.pickup'), value: booking.pickup }] : []),
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
            ❌ {error}
          </div>
        )}

        {booking && (
          <div id="confirmation-sheet" className="glass-card animate-scale-in" style={{
            padding: '2.5rem', background: '#ffffff', color: '#1e293b',
            borderRadius: '16px', border: '1px solid var(--border-medium)', boxShadow: 'var(--shadow-xl)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '2px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src="/logo_gold.png" alt="Orluxus" style={{ height: '44px', width: 'auto', objectFit: 'contain' }} onError={e => { e.target.style.display = 'none'; }} />
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#b45309', margin: 0, letterSpacing: '1px', fontFamily: 'var(--font-en)' }}>ORLUXUS</h2>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Premium Egypt Travel &amp; Tourism</span>
                </div>
              </div>
              <div style={{ textAlign: isAr ? 'left' : 'right' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>{t('booking.ref')}</div>
                <div style={{ fontFamily: 'var(--font-en)', fontWeight: '900', fontSize: '1.1rem', color: '#0f172a', letterSpacing: '1px' }}>{booking.ref}</div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <span style={{
                display: 'inline-block', padding: '0.5rem 2rem', borderRadius: '9999px',
                fontWeight: '800', fontSize: '1rem', letterSpacing: '1px',
                color: STATUS_COLORS[statusKey] || '#64748b',
                background: STATUS_BG[statusKey] || '#f8fafc',
                border: '2px solid ' + (STATUS_COLORS[statusKey] || '#e2e8f0'),
              }}>
                {statusEmoji} {statusLabel}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {rows.map(({ label, value }, i) => (
                <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', padding: '0.9rem 1.1rem', border: '1px solid #e2e8f0', textAlign: isAr ? 'right' : 'left' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>{label}</div>
                  <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem', wordBreak: 'break-word' }}>{value || '—'}</div>
                </div>
              ))}
            </div>

            {/* Digital Signature & Terms Agreement */}
            <div style={{ border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '1.2rem 1.5rem', marginTop: '1.5rem' }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', textAlign: isAr ? 'right' : 'left' }}>
                📋 {t('booking.termsTitle')}
              </h4>
              <p style={{ margin: '0 0 10px', fontSize: '0.82rem', color: '#475569', lineHeight: '1.6', textAlign: isAr ? 'right' : 'left' }}>
                {t('booking.termsBody', { name: booking.customerName })}
              </p>
              <p style={{ margin: '0 0 12px', fontSize: '0.82rem', color: '#475569', lineHeight: '1.6', fontStyle: 'italic', borderTop: '1px solid #e2e8f0', paddingTop: '8px', textAlign: isAr ? 'right' : 'left' }}>
                {t('booking.termsNote')}
              </p>
              <div style={{ background: '#f1f5f9', borderRadius: '8px', padding: '10px 14px', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.78rem', color: '#64748b' }}>
                <span>✍️ <strong>{t('booking.digitallyAgreed')}</strong> {booking.customerName}</span>
                {booking.createdAt && <span>🕐 <strong>{t('booking.bookingTime')}</strong> {new Date(booking.createdAt).toLocaleString(isAr ? 'ar-EG' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</span>}
                <span>🔑 <strong>{t('booking.bookingRef')}</strong> {booking.ref}</span>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px dashed #e2e8f0', fontSize: '0.8rem', color: '#94a3b8' }}>
              {t('booking.thankYou')}
            </div>
          </div>
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
          body { background: #fff !important; color: #000 !important; }
          .hide-print, nav, header, footer { display: none !important; }
          #confirmation-sheet { box-shadow: none !important; border: none !important; }
        }
      `}</style>
    </main>
  );
}
