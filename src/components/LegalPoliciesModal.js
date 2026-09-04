'use client';

import React, { useState } from 'react';
import { CANCELLATION_POLICY_EN, TERMS_AND_CONDITIONS_EN } from '@/lib/legalPoliciesData';

export default function LegalPoliciesModal({
  isOpen,
  onClose,
  onAccept,
  customerName = '',
  email = '',
  phone = '',
  serviceName = '',
  locale = 'en',
  initialTab = 'both' // 'both' | 'terms' | 'cancellation'
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const isAr = locale === 'ar';

  if (!isOpen) return null;

  const clientDisplayName = customerName?.trim() || (isAr ? '[اسم العميل]' : '[Client Name]');
  const clientDisplayEmail = email?.trim() || (isAr ? '[البريد الإلكتروني]' : '[Email Address]');
  const clientDisplayPhone = phone?.trim() || (isAr ? '[رقم الهاتف]' : '[Phone Number]');
  const sigDate = new Date().toLocaleString(isAr ? 'ar-EG' : 'en-GB', {
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  const handlePrint = () => {
    window.print();
  };

  const handleAcceptAndClose = () => {
    if (onAccept) onAccept();
    onClose();
  };

  return (
    <div 
      className="legal-modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 7, 12, 0.88)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(8px, 2vw, 24px)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        direction: isAr ? 'rtl' : 'ltr'
      }}
    >
      <div 
        className="legal-modal-container glass-card animate-scale-up"
        style={{
          background: 'linear-gradient(180deg, #131823 0%, #0d111a 100%)',
          width: '100%',
          maxWidth: '1280px',
          maxHeight: '92vh',
          borderRadius: '16px',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 35px rgba(212, 175, 55, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#e6edf3'
        }}
      >
        {/* Modal Top Header */}
        <div style={{
          padding: '16px 24px',
          background: 'rgba(0, 0, 0, 0.4)',
          borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.4rem' }}>⚖️</span>
              <h2 style={{
                margin: 0,
                fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                color: '#d4af37',
                fontWeight: '800',
                letterSpacing: '0.5px'
              }}>
                {isAr ? 'الاتفاقية الرسمية، الشروط والأحكام وسياسة الإلغاء' : 'Official Legal Contract: Terms, Conditions & Cancellation Policy'}
              </h2>
            </div>
            <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#8b949e' }}>
              ORLUXUS MARKETING AND BRANDING • Hurghada, Red Sea, Egypt
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handlePrint}
              type="button"
              className="hide-print"
              style={{
                background: 'rgba(212, 175, 55, 0.12)',
                border: '1px solid rgba(212, 175, 55, 0.5)',
                color: '#d4af37',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '0.82rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              🖨️ {isAr ? 'طباعة / حفظ PDF' : 'Print / Save PDF'}
            </button>

            <button
              onClick={onClose}
              type="button"
              className="hide-print"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                fontSize: '1.2rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Client Digital Verification Banner */}
        <div style={{
          background: 'rgba(212, 175, 55, 0.05)',
          borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
          padding: '10px 24px',
          fontSize: '0.8rem',
          color: '#c9d1d9',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '8px 16px'
        }}>
          <div><strong style={{ color: '#d4af37' }}>{isAr ? 'العميل (الطرف الثاني):' : 'Client (2nd Party):'}</strong> {clientDisplayName}</div>
          <div><strong style={{ color: '#d4af37' }}>{isAr ? 'البريد:' : 'Email:'}</strong> {clientDisplayEmail}</div>
          <div><strong style={{ color: '#d4af37' }}>{isAr ? 'الهاتف:' : 'Phone:'}</strong> {clientDisplayPhone}</div>
          <div><strong style={{ color: '#d4af37' }}>{isAr ? 'الرحلة/الخدمة:' : 'Excursion:'}</strong> {serviceName || (isAr ? 'رحلة سياحية' : 'Selected Tour')}</div>
          <div><strong style={{ color: '#d4af37' }}>{isAr ? 'التاريخ والوقت:' : 'Timestamp:'}</strong> {sigDate}</div>
          <div><strong style={{ color: '#10b981' }}>{isAr ? 'السند القانوني:' : 'Legal Basis:'}</strong> {isAr ? 'قانون 15 لسنة 2004' : 'Egyptian Law 15/2004'}</div>
        </div>

        {/* View Switcher Controls (Dual Split vs Individual Part) */}
        <div className="hide-print" style={{
          padding: '8px 24px',
          background: 'rgba(0, 0, 0, 0.25)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          overflowX: 'auto'
        }}>
          <span style={{ fontSize: '0.8rem', color: '#8b949e', whiteSpace: 'nowrap' }}>
            {isAr ? 'طريقة العرض:' : 'Layout View:'}
          </span>
          <button
            type="button"
            onClick={() => setActiveTab('both')}
            style={{
              background: activeTab === 'both' ? 'linear-gradient(135deg, #d4af37, #aa820a)' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'both' ? '#000' : '#fff',
              border: 'none',
              padding: '5px 14px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            ⚖️ {isAr ? 'عرض القسمين معاً (نصفين)' : 'Split Side-by-Side (Both Halves)'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            style={{
              background: activeTab === 'terms' ? 'linear-gradient(135deg, #d4af37, #aa820a)' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'terms' ? '#000' : '#fff',
              border: 'none',
              padding: '5px 14px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            📜 {isAr ? 'الشروط والأحكام فقط' : 'Terms & Conditions Only'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cancellation')}
            style={{
              background: activeTab === 'cancellation' ? 'linear-gradient(135deg, #d4af37, #aa820a)' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'cancellation' ? '#000' : '#fff',
              border: 'none',
              padding: '5px 14px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            🔄 {isAr ? 'سياسة الإلغاء والاسترداد فقط' : 'Cancellation Policy Only'}
          </button>
        </div>

        {/* Scrollable Dual-Pane Content Body */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px',
          display: activeTab === 'both' ? 'grid' : 'block',
          gridTemplateColumns: activeTab === 'both' ? 'repeat(auto-fit, minmax(380px, 1fr))' : '1fr',
          gap: '24px'
        }}>
          
          {/* ══════ PART ONE: TERMS AND CONDITIONS ══════ */}
          {(activeTab === 'both' || activeTab === 'terms') && (
            <div style={{
              background: 'rgba(0, 0, 0, 0.22)',
              borderRadius: '12px',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {/* Part 1 Header Badge */}
              <div style={{ borderBottom: '2px solid #d4af37', paddingBottom: '10px' }}>
                <span style={{
                  background: 'rgba(212, 175, 55, 0.15)',
                  color: '#d4af37',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '0.72rem',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}>
                  PART 1 / الجزء الأول
                </span>
                <h3 style={{ margin: '6px 0 2px 0', color: '#fff', fontSize: '1.1rem', fontWeight: '800' }}>
                  {TERMS_AND_CONDITIONS_EN.title}
                </h3>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#8b949e' }}>
                  Integrated Marketing Services &amp; Tourism Brokerage Terms
                </p>
              </div>

              {/* Important Electronic Consent Callout */}
              <div style={{
                background: 'rgba(212, 175, 55, 0.08)',
                borderLeft: isAr ? 'none' : '4px solid #d4af37',
                borderRight: isAr ? '4px solid #d4af37' : 'none',
                padding: '12px 14px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                lineHeight: '1.6',
                color: '#f0f6fc'
              }}>
                <strong style={{ color: '#d4af37', display: 'block', marginBottom: '4px' }}>
                  ⚠️ IMPORTANT: ELECTRONIC CONSENT &amp; BINDING AGREEMENT
                </strong>
                Please read these Terms and Conditions carefully before using our platform or making a booking. By proceeding, you enter into a legally binding agreement with <strong>ORLUXUS MARKETING AND BRANDING</strong>.
              </div>

              {/* Sections 1 to 15 */}
              {TERMS_AND_CONDITIONS_EN.sections.map((sec) => (
                <div key={sec.num} style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  padding: '14px'
                }}>
                  <h4 style={{
                    margin: '0 0 8px 0',
                    color: '#d4af37',
                    fontSize: '0.9rem',
                    fontWeight: '700'
                  }}>
                    {sec.title}
                  </h4>
                  <div style={{
                    fontSize: '0.82rem',
                    lineHeight: '1.7',
                    color: '#c9d1d9',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {sec.content}
                  </div>
                </div>
              ))}

              {/* Part 1 Footer */}
              <div style={{
                fontSize: '0.75rem',
                color: '#8b949e',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                paddingTop: '10px'
              }}>
                <strong>{TERMS_AND_CONDITIONS_EN.footer.company}</strong> • {TERMS_AND_CONDITIONS_EN.footer.address}
              </div>
            </div>
          )}

          {/* ══════ PART TWO: CANCELLATION AND REFUND POLICY ══════ */}
          {(activeTab === 'both' || activeTab === 'cancellation') && (
            <div style={{
              background: 'rgba(0, 0, 0, 0.22)',
              borderRadius: '12px',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {/* Part 2 Header Badge */}
              <div style={{ borderBottom: '2px solid #60a5fa', paddingBottom: '10px' }}>
                <span style={{
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: '#60a5fa',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '0.72rem',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}>
                  PART 2 / الجزء الثاني
                </span>
                <h3 style={{ margin: '6px 0 2px 0', color: '#fff', fontSize: '1.1rem', fontWeight: '800' }}>
                  {CANCELLATION_POLICY_EN.title}
                </h3>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#8b949e' }}>
                  {CANCELLATION_POLICY_EN.subtitle}
                </p>
              </div>

              {/* Preamble & Legal Basis */}
              <div style={{
                background: 'rgba(59, 130, 246, 0.08)',
                borderLeft: isAr ? 'none' : '4px solid #60a5fa',
                borderRight: isAr ? '4px solid #60a5fa' : 'none',
                padding: '12px 14px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                lineHeight: '1.6',
                color: '#f0f6fc'
              }}>
                <strong style={{ color: '#60a5fa', display: 'block', marginBottom: '4px' }}>
                  ⚖️ {CANCELLATION_POLICY_EN.preamble.title}
                </strong>
                {CANCELLATION_POLICY_EN.preamble.paragraphs.map((p, idx) => (
                  <p key={idx} style={{ margin: '0 0 6px 0', whiteSpace: 'pre-wrap' }}>{p}</p>
                ))}
              </div>

              {/* Articles 1 to 9 */}
              {CANCELLATION_POLICY_EN.articles.map((art) => (
                <div key={art.num} style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  padding: '14px'
                }}>
                  <h4 style={{
                    margin: '0 0 8px 0',
                    color: '#60a5fa',
                    fontSize: '0.9rem',
                    fontWeight: '700'
                  }}>
                    {art.title}
                  </h4>
                  {art.intro && (
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: '#8b949e', fontStyle: 'italic' }}>
                      {art.intro}
                    </p>
                  )}
                  {art.clauses && art.clauses.map((clause, cIdx) => (
                    <div key={cIdx} style={{
                      fontSize: '0.82rem',
                      lineHeight: '1.7',
                      color: '#c9d1d9',
                      marginBottom: '8px',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {clause}
                    </div>
                  ))}

                  {/* Article 9 Legislative Support Table */}
                  {art.table && (
                    <div style={{ marginTop: '12px', overflowX: 'auto' }}>
                      <p style={{ fontSize: '0.78rem', color: '#8b949e', marginBottom: '6px' }}>{art.tableIntro}</p>
                      <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '0.75rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>
                        <thead>
                          <tr style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', textAlign: isAr ? 'right' : 'left' }}>
                            <th style={{ padding: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>Legislative Law</th>
                            <th style={{ padding: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>Article</th>
                            <th style={{ padding: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>Purpose / Legal Effect</th>
                          </tr>
                        </thead>
                        <tbody>
                          {art.table.map((row, rIdx) => (
                            <tr key={rIdx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                              <td style={{ padding: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#d4af37', fontWeight: '600' }}>{row.law}</td>
                              <td style={{ padding: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#60a5fa', fontWeight: 'bold' }}>{row.article}</td>
                              <td style={{ padding: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#c9d1d9' }}>{row.purpose}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}

              {/* Part 2 Footer */}
              <div style={{
                fontSize: '0.75rem',
                color: '#8b949e',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                paddingTop: '10px'
              }}>
                <strong>{CANCELLATION_POLICY_EN.footer.company}</strong> • {CANCELLATION_POLICY_EN.footer.address}
              </div>
            </div>
          )}

        </div>

        {/* Arabic Language Prevalence Notice */}
        <div style={{
          padding: '8px 24px',
          background: 'rgba(212, 175, 55, 0.08)',
          borderTop: '1px solid rgba(212, 175, 55, 0.2)',
          fontSize: '0.74rem',
          color: '#d4af37',
          textAlign: 'center',
          fontStyle: 'italic'
        }}>
          * Language Prevalence Notice: This Agreement is prepared in Arabic. In case of translation into any other language, the Arabic version shall prevail in the event of any conflict or dispute. (تكون النسخة العربية هي السائدة عند أي نزاع أو تعارض).
        </div>

        {/* Modal Actions Footer */}
        <div className="hide-print" style={{
          padding: '14px 24px',
          background: 'rgba(0, 0, 0, 0.4)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <div style={{ fontSize: '0.78rem', color: '#8b949e' }}>
            {isAr ? 'بالنقر أدناه، تُقر بموافقتك الإلكترونية الكاملة على الجزئين.' : 'By clicking below, you confirm full electronic agreement to both parts.'}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{
                padding: '8px 20px',
                fontSize: '0.85rem',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              {isAr ? 'إغلاق' : 'Close'}
            </button>

            <button
              type="button"
              onClick={handleAcceptAndClose}
              className="btn btn-primary"
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #aa820a 100%)',
                color: '#000',
                fontWeight: '800',
                padding: '8px 24px',
                fontSize: '0.88rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
              }}
            >
              ✓ {isAr ? 'قرأت ووافقت على الشروط وسياسة الإلغاء' : 'I Have Read & Accept Both Terms & Policy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
