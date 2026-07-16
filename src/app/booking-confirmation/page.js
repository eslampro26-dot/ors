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
  const { locale } = useLanguage();
  const [refInput, setRefInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');

  const isAr = locale === 'ar';

  const labels = {
    pageTitle: isAr ? '????? ?????' : 'Booking Confirmation',
    subtitle: isAr ? '???? ?? ???? ???? ?????? ??????? ???????' : 'Search your booking by reference number to view its details',
    placeholder: isAr ? '???? ??? ?????? — ????: CASH-TX-1784' : 'Enter booking reference — e.g. CASH-TX-1784',
    searchBtn: isAr ? '?? ??? ?? ?????' : '?? Search Booking',
    notFound: isAr ? '?? ??? ?????? ??? ??? ???? ?????. ???? ?? ????? ????? ??? ????.' : 'No booking found with this reference. Please check and try again.',
    ref: isAr ? '??? ??????' : 'Booking Ref',
    customer: isAr ? '??? ??????' : 'Customer Name',
    service: isAr ? '??????' : 'Service',
    date: isAr ? '????? ??????' : 'Scheduled Date',
    travelers: isAr ? '??? ?????????' : 'Travelers',
    amount: isAr ? '?????? ??????' : 'Total Amount',
    payStatus: isAr ? '???? ?????' : 'Payment Status',
    payMethod: isAr ? '????? ?????' : 'Payment Method',
    agent: isAr ? '??????' : 'Agent',
    pickup: isAr ? '???? ????????' : 'Pickup Location',
    printBtn: isAr ? '??? ????? ???????' : '??? Print Confirmation',
    homeBtn: isAr ? '?? ?????? ????????' : '?? Return to Home',
    persons: isAr ? '?????' : 'Persons',
    hint: isAr ? '??? ?????? ????? ?? ????? ??????? ?? ???????? ????????.' : 'Your reference is in your confirmation email or printed invoice.',
    statuses: {
      confirmed: isAr ? '????' : 'CONFIRMED',
      pending: isAr ? '?? ????????' : 'PENDING',
      cancelled: isAr ? '????' : 'CANCELLED',
      completed: isAr ? '?????' : 'COMPLETED',
    },
    payMethods: {
      bank_transfer: isAr ? '????? ????' : 'Bank Transfer',
      onsite: isAr ? '??? ??? ??????' : 'Cash on Site',
      card: 'Dafah Credit Card',
    },
  };

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
      if (!res.ok) { setError(data.error || labels.notFound); }
      else { setBooking(data); }
    } catch { setError(labels.notFound); }
    finally { setLoading(false); }
  };

  const statusKey = (booking?.status || 'pending').toLowerCase();
  const statusLabel = labels.statuses[statusKey] || (booking?.status || '').toUpperCase();
  const payLabel = labels.payMethods[booking?.paymentType] || (booking?.paymentType || '—').toUpperCase();

  const rows = booking ? [
    { label: labels.customer, value: booking.customerName },
    { label: labels.service, value: booking.service },
    { label: labels.date, value: booking.date },
    { label: labels.travelers, value: booking.travelers + ' ' + labels.persons },
    { label: labels.amount, value: '€' + Number(booking.amount).toFixed(2) },
    { label: labels.payStatus, value: statusLabel },
    { label: labels.payMethod, value: payLabel },
    ...(booking.agentName ? [{ label: labels.agent, value: booking.agentName }] : []),
    ...(booking.pickup ? [{ label: labels.pickup, value: booking.pickup }] : []),
  ] : [];

  const statusEmoji = { confirmed: '?', pending: '?', cancelled: '?', completed: '??' }[statusKey] || '??';

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
          }}>??</div>
          <h1 className="section-title" style={{ marginBottom: '0.75rem', fontSize: '2.2rem' }}>{labels.pageTitle}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6', maxWidth: '500px', margin: '0 auto' }}>{labels.subtitle}</p>
        </div>
      </div>

      <div className="container animate-fade-in-up" style={{ maxWidth: '680px', paddingTop: '3rem' }}>
        <form onSubmit={handleSearch} style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="text" value={refInput}
              onChange={e => setRefInput(e.target.value)}
              placeholder={labels.placeholder}
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
              {loading ? '?' : labels.searchBtn}
            </button>
          </div>
        </form>

        {error && (
          <div className="glass-card animate-fade-in-up" style={{ padding: '1.2rem 1.5rem', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)', borderRadius: '12px', textAlign: 'center', color: '#ef4444', marginBottom: '2rem' }}>
            ? {error}
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
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>{labels.ref}</div>
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

            <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px dashed #e2e8f0', fontSize: '0.8rem', color: '#94a3b8' }}>
              {isAr ? '????? ???????? ORLUXUS. ????? ?? ???? ?????. ??' : 'Thank you for choosing ORLUXUS. We wish you an amazing trip. ??'}
            </div>
          </div>
        )}

        {booking && (
          <div className="hide-print" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
            <button onClick={() => window.print()} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.8rem', cursor: 'pointer' }}>
              {labels.printBtn}
            </button>
            <Link href="/" className="btn btn-secondary" style={{ padding: '0.8rem 1.8rem' }}>{labels.homeBtn}</Link>
          </div>
        )}

        {!booking && !error && (
          <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            ?? {labels.hint}
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
