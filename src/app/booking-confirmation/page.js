'use client';

import { useState, useEffect, Suspense } from 'react';
import Navbar from '@/components/navigation/Navbar';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useSettings } from '@/hooks/useSettings';
import { useSearchParams } from 'next/navigation';

const STATUS_COLORS = {
  confirmed: '#10b981', pending: '#f59e0b', cancelled: '#ef4444', completed: '#6366f1',
};
const STATUS_BG = {
  confirmed: '#ecfdf5', pending: '#fef3c7', cancelled: '#fef2f2', completed: '#eef2ff',
};

function BookingConfirmationContent() {
  const { locale, t, isReady } = useLanguage();
  const { settings } = useSettings();
  const searchParams = useSearchParams();
  const urlRef = searchParams.get('ref') || '';

  const emergencyPhone = settings?.emergencyPhone || '+201038820014';
  const whatsappPhone = settings?.whatsapp || '+201038820019';

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

  const finalAmt = Number(booking?.amount || booking?.finalAmount || 0) || 0;
  const originalAmt = Number(booking?.originalAmount || finalAmt) || 0;
  const discountAmt = Number(booking?.discountAmount || 0) || 0;
  const adultPriceVal = Number(booking?.adultPrice) || 0;
  const childPriceVal = Number(booking?.childPrice) || 0;
  const infantPriceVal = Number(booking?.infantPrice) || 0;
  const numAdults = Number(booking?.travelers || 1);
  const numChildren = Number(booking?.children || 0);
  const numInfants = Number(booking?.infants || 0);

  const totalTravelers = numAdults + numChildren + numInfants;
  const travelersDisplay = totalTravelers > numAdults
    ? (locale === 'ar' 
        ? `${totalTravelers} أشخاص (${numAdults} كبار${numChildren > 0 ? `، ${numChildren} أطفال` : ''}${numInfants > 0 ? `، ${numInfants} رضع` : ''})`
        : locale === 'de'
        ? `${totalTravelers} Personen (${numAdults} Erwachsene${numChildren > 0 ? `, ${numChildren} Kinder` : ''}${numInfants > 0 ? `, ${numInfants} Kleinkinder` : ''})`
        : `${totalTravelers} Persons (${numAdults} Adults${numChildren > 0 ? `, ${numChildren} Child(ren)` : ''}${numInfants > 0 ? `, ${numInfants} Infant(s)` : ''})`)
    : `${numAdults} ${t('booking.persons')}`;

  const rows = booking ? [
    { label: t('booking.customer'), value: booking.customerName || booking.customer || '—' },
    { label: t('booking.service'), value: booking.service || '—' },
    { label: t('booking.date'), value: booking.date || '—' },
    { label: t('booking.travelers'), value: travelersDisplay },
    { label: t('booking.amount'), value: '€' + finalAmt.toFixed(2) },
    { label: t('booking.payStatus'), value: statusLabel },
    { label: t('booking.payMethod'), value: payLabel },
    ...(booking.email ? [{ label: 'Email', value: booking.email }] : []),
    ...(booking.phone ? [{ label: 'Phone', value: booking.phone }] : []),
    ...(booking.whatsapp ? [{ label: 'WhatsApp', value: booking.whatsapp }] : []),
    ...(booking.agentName && booking.agentName !== 'مباشر (بدون وكيل)' && booking.agentName !== 'مباشر' && booking.agentName !== 'Direct (No Agent)' && booking.agentName !== 'Direct'
      ? [{ label: t('booking.agent'), value: (booking.promoCode || booking.agentId || '—').toUpperCase() }]
      : []),
    ...(booking.pickup ? [{ label: t('booking.pickup'), value: booking.pickup }] : []),
    ...(booking.extras ? [{ label: 'Add-ons', value: booking.extras, fullWidth: true }] : []),
    ...(booking.promoCode && (!booking.agentId || booking.agentId === '') ? [{ label: 'Promo Code', value: booking.promoCode }] : []),
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
                #confirmation-sheet * { direction: ltr !important; text-align: left !important; font-family: var(--font-en) !important; }
              }
            ` }} />

            <div id="confirmation-sheet" className="glass-card animate-scale-in" style={{
              padding: '2rem 2.5rem', background: '#ffffff', color: '#0f172a',
              borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-xl)',
              maxWidth: '100%', margin: '0 auto', width: '100%'
            }}>
              {/* Invoice Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.2rem', borderBottom: '2px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#d97706', margin: 0, letterSpacing: '3px', fontFamily: 'var(--font-en)' }}>ORLUXUS</h2>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '600' }}>MARKETING TOURISM AGENCY</span>
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

              {/* Price Breakdown Table */}
              {(finalAmt > 0 || originalAmt > 0 || adultPriceVal > 0 || childPriceVal > 0 || infantPriceVal > 0) && (() => {
                const effectiveAdultPrice = adultPriceVal > 0 
                  ? adultPriceVal 
                  : (numAdults > 0 ? Math.max(0, originalAmt - (numChildren * childPriceVal) - (numInfants * infantPriceVal)) / numAdults : 0);

                return (
                  <div style={{ marginBottom: '1.2rem' }}>
                    <h4 style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 'bold', margin: '0 0 0.6rem', textAlign: isAr ? 'right' : 'left' }}>
                      💰 Price Breakdown
                    </h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc' }}>
                          <th style={{ padding: '10px 12px', textAlign: isAr ? 'right' : 'left', color: '#64748b', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase' }}>Service</th>
                          <th style={{ padding: '10px 12px', textAlign: 'center', color: '#64748b', fontWeight: '700', fontSize: '0.75rem' }}>Qty</th>
                          <th style={{ padding: '10px 12px', textAlign: 'right', color: '#64748b', fontWeight: '700', fontSize: '0.75rem' }}>Rate</th>
                          <th style={{ padding: '10px 12px', textAlign: 'right', color: '#64748b', fontWeight: '700', fontSize: '0.75rem' }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 12px', fontWeight: '600', color: '#0f172a' }}>{booking.service} (Adults)</td>
                          <td style={{ padding: '10px 12px', textAlign: 'center', color: '#475569' }}>{numAdults}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', color: '#475569' }}>€{effectiveAdultPrice.toFixed(2)}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>€{(numAdults * effectiveAdultPrice).toFixed(2)}</td>
                        </tr>
                      {numChildren > 0 && (
                        <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8f9fa' }}>
                          <td style={{ padding: '10px 12px', fontWeight: '600', color: '#0f172a' }}>Children (2-12 yrs)</td>
                          <td style={{ padding: '10px 12px', textAlign: 'center', color: '#475569' }}>{numChildren}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', color: '#475569' }}>€{childPriceVal.toFixed(2)}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>€{(numChildren * childPriceVal).toFixed(2)}</td>
                        </tr>
                      )}
                      {numInfants > 0 && (
                        <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8f9fa' }}>
                          <td style={{ padding: '10px 12px', fontWeight: '600', color: '#0f172a' }}>Infants (under 2)</td>
                          <td style={{ padding: '10px 12px', textAlign: 'center', color: '#475569' }}>{numInfants}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', color: '#475569' }}>€{infantPriceVal.toFixed(2)}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>€{(numInfants * infantPriceVal).toFixed(2)}</td>
                        </tr>
                      )}
                      {booking.extras && (() => {
                        const adultsRowTotal = numAdults * effectiveAdultPrice;
                        const childrenRowTotal = numChildren * (childPriceVal || 0);
                        const infantsRowTotal = numInfants * (infantPriceVal || 0);
                        const baseAndPaxTotal = adultsRowTotal + childrenRowTotal + infantsRowTotal;
                        const extrasCost = Math.max(0, originalAmt - baseAndPaxTotal);

                        return (
                          <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fafafb' }}>
                            <td style={{ padding: '10px 12px', fontWeight: '600', color: '#0f172a' }}>🎁 Add-ons: {booking.extras}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'center', color: '#475569' }}>1</td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', color: '#475569' }}>{extrasCost > 0 ? `€${extrasCost.toFixed(2)}` : '—'}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>{extrasCost > 0 ? `€${extrasCost.toFixed(2)}` : 'Included'}</td>
                          </tr>
                        );
                      })()}
                      {discountAmt > 0 && (
                        <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fef2f2' }}>
                          <td colSpan={3} style={{ padding: '10px 12px', color: '#dc2626', fontWeight: '600' }}>🏷 Promo Discount {booking.promoCode ? `(${booking.promoCode})` : ''}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', color: '#dc2626', fontWeight: '700' }}>-€{discountAmt.toFixed(2)}</td>
                        </tr>
                      )}
                      <tr style={{ background: '#0f172a' }}>
                        <td colSpan={3} style={{ padding: '12px', fontWeight: '800', color: '#c9a227', fontSize: '0.9rem' }}>Total</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: '900', color: '#c9a227', fontSize: '1.1rem' }}>€{finalAmt.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )})()}

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

                {/* Emergency Contact Information (Dynamic from settings) */}
                <div style={{ marginTop: '0.8rem', paddingTop: '0.6rem', borderTop: '1px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', fontSize: '0.75rem', color: '#0f172a', fontWeight: '600' }}>
                  <span>24/7 Emergency Support Hotline: {emergencyPhone}</span>
                  <span>WhatsApp: {whatsappPhone}</span>
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
