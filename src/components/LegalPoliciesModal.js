'use client';

import React, { useState, useEffect } from 'react';
import { 
  SUPPORTED_LEGAL_LANGUAGES, 
  getLegalUI, 
  getTermsAndConditions, 
  getCancellationPolicy 
} from '@/lib/legalPoliciesData';

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
  const [currentLang, setCurrentLang] = useState(locale || 'ar');
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync with locale prop when opened
  useEffect(() => {
    if (locale) {
      setCurrentLang(locale);
    }
  }, [locale, isOpen]);

  if (!isOpen) return null;

  const langMeta = SUPPORTED_LEGAL_LANGUAGES.find(l => l.code === currentLang) || SUPPORTED_LEGAL_LANGUAGES[0];
  const isRtl = langMeta.dir === 'rtl';

  const ui = getLegalUI(currentLang);
  const terms = getTermsAndConditions(currentLang);
  const cancellation = getCancellationPolicy(currentLang);

  const clientDisplayName = customerName?.trim() || (isRtl ? '[اسم العميل]' : '[Client Name]');
  const clientDisplayEmail = email?.trim() || (isRtl ? '[البريد الإلكتروني]' : '[Email Address]');
  const clientDisplayPhone = phone?.trim() || (isRtl ? '[رقم الهاتف]' : '[Phone Number]');
  const clientDisplayService = serviceName?.trim() || (isRtl ? '[الخدمة المختارة]' : '[Selected Trip / Service]');
  
  const sigDate = new Date().toLocaleString(isRtl ? 'ar-EG' : 'en-GB', {
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  const handleAcceptAndClose = () => {
    if (onAccept) onAccept();
    onClose();
  };

  return (
    <div 
      className="legal-modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(8px, 2vw, 24px)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
    >
      <div 
        className="legal-modal-container glass-card"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(253, 251, 247, 0.95) 0%, rgba(248, 246, 240, 0.98) 100%), url('/egypt_bg.jpg')`,
          backgroundAttachment: 'scroll',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          width: '100%',
          maxWidth: '1320px',
          maxHeight: '94vh',
          borderRadius: '16px',
          border: '1px solid rgba(201, 162, 39, 0.4)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.25), 0 0 35px rgba(201, 162, 39, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#1f2937',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Cairo", "Tajawal", Helvetica, Arial, sans-serif'
        }}
      >
        {/* Modal Top Header */}
        <div style={{
          padding: '14px 22px',
          background: 'rgba(255, 255, 255, 0.96)',
          borderBottom: '1px solid rgba(201, 162, 39, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.3rem' }}>⚖️</span>
              <h2 style={{
                margin: 0,
                fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                color: '#8c6a12',
                fontWeight: '900',
                letterSpacing: '0.3px'
              }}>
                {ui.pageTitle}
              </h2>
            </div>
            <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#6b7280' }}>
              ORLUXUS MARKETING AND BRANDING • Hurghada, Red Sea, Egypt
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={onClose}
              type="button"
              className="hide-print"
              aria-label="Close modal"
              style={{
                background: '#ffffff',
                border: '1px solid #d1d5db',
                color: '#4b5563',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                lineHeight: 1
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* 10 Languages Selector Bar inside modal */}
        <div className="hide-print" style={{
          background: 'rgba(255, 255, 255, 0.92)',
          borderBottom: '1px solid rgba(201, 162, 39, 0.2)',
          padding: '8px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflowX: 'auto',
          flexWrap: 'nowrap'
        }}>
          <span style={{ 
            fontSize: '0.8rem', 
            fontWeight: '700', 
            color: '#8c6a12',
            whiteSpace: 'nowrap',
            marginRight: isRtl ? '0' : '4px',
            marginLeft: isRtl ? '4px' : '0'
          }}>
            🌐 {ui.selectLanguage}
          </span>
          {SUPPORTED_LEGAL_LANGUAGES.map((lang) => {
            const isActive = currentLang === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => setCurrentLang(lang.code)}
                style={{
                  background: isActive ? 'linear-gradient(135deg, #c9a227, #aa841a)' : '#ffffff',
                  color: isActive ? '#ffffff' : '#374151',
                  border: isActive ? '1px solid #aa841a' : '1px solid #e5e7eb',
                  borderRadius: '16px',
                  padding: '3px 10px',
                  fontSize: '0.78rem',
                  fontWeight: isActive ? '700' : '500',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  boxShadow: isActive ? '0 2px 6px rgba(201, 162, 39, 0.25)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            );
          })}
        </div>

        {/* Main Scrollable Content Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 22px',
          display: 'grid',
          gridTemplateColumns: activeTab === 'both' ? 'repeat(auto-fit, minmax(min(100%, 540px), 1fr))' : '1fr',
          gap: '20px',
          alignItems: 'start'
        }}>
          
          {/* SECTION 1: TERMS & CONDITIONS */}
          {(activeTab === 'both' || activeTab === 'terms') && (
            <div style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid rgba(201, 162, 39, 0.3)',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)',
              padding: '20px'
            }}>
              <div style={{
                borderBottom: '2px solid rgba(201, 162, 39, 0.35)',
                paddingBottom: '12px',
                marginBottom: '16px'
              }}>
                <span style={{
                  background: '#8c6a12',
                  color: '#ffffff',
                  fontSize: '0.68rem',
                  fontWeight: '800',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  textTransform: 'uppercase'
                }}>
                  {ui.part1Title}
                </span>
                <h3 style={{
                  fontSize: '1.15rem',
                  color: '#111827',
                  margin: '8px 0 4px 0',
                  fontWeight: '800'
                }}>
                  {terms.title}
                </h3>
                <div style={{
                  background: 'rgba(201, 162, 39, 0.08)',
                  border: '1px solid rgba(201, 162, 39, 0.2)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  marginTop: '8px',
                  fontSize: '0.78rem',
                  color: '#4b5563',
                  lineHeight: '1.55'
                }}>
                  {terms.importantNotice}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {terms.sections.map((section) => (
                  <div 
                    key={section.num}
                    style={{
                      background: '#fafafa',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      border: '1px solid #f3f4f6'
                    }}
                  >
                    <h4 style={{
                      margin: '0 0 6px 0',
                      fontSize: '0.88rem',
                      color: '#8c6a12',
                      fontWeight: '800'
                    }}>
                      {section.title}
                    </h4>
                    <div style={{
                      color: '#374151',
                      fontSize: '0.82rem',
                      lineHeight: '1.7',
                      whiteSpace: 'pre-line'
                    }}>
                      {section.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: CANCELLATION POLICY */}
          {(activeTab === 'both' || activeTab === 'cancellation') && (
            <div style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid rgba(201, 162, 39, 0.3)',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)',
              padding: '20px'
            }}>
              <div style={{
                borderBottom: '2px solid rgba(201, 162, 39, 0.35)',
                paddingBottom: '12px',
                marginBottom: '16px'
              }}>
                <span style={{
                  background: '#c9a227',
                  color: '#ffffff',
                  fontSize: '0.68rem',
                  fontWeight: '800',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  textTransform: 'uppercase'
                }}>
                  {ui.part2Title}
                </span>
                <h3 style={{
                  fontSize: '1.15rem',
                  color: '#111827',
                  margin: '8px 0 4px 0',
                  fontWeight: '800'
                }}>
                  {cancellation.title}
                </h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#6b7280', fontStyle: 'italic' }}>
                  {cancellation.subtitle}
                </p>

                {cancellation.preamble && (
                  <div style={{
                    background: 'rgba(201, 162, 39, 0.08)',
                    border: '1px solid rgba(201, 162, 39, 0.2)',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    marginTop: '8px'
                  }}>
                    <div style={{ fontWeight: '700', fontSize: '0.8rem', color: '#8c6a12', marginBottom: '2px' }}>
                      ⚖️ {cancellation.preamble.title}
                    </div>
                    {cancellation.preamble.paragraphs.map((p, pIdx) => (
                      <p key={pIdx} style={{ margin: '2px 0', fontSize: '0.78rem', color: '#4b5563', whiteSpace: 'pre-line' }}>
                        {p}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {cancellation.articles.map((article) => (
                  <div
                    key={article.num}
                    style={{
                      background: '#fafafa',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      border: '1px solid #f3f4f6'
                    }}
                  >
                    <h4 style={{
                      margin: '0 0 6px 0',
                      fontSize: '0.88rem',
                      color: '#8c6a12',
                      fontWeight: '800'
                    }}>
                      {article.title}
                    </h4>
                    {article.intro && (
                      <p style={{ margin: '0 0 6px 0', fontSize: '0.8rem', color: '#4b5563', fontStyle: 'italic' }}>
                        {article.intro}
                      </p>
                    )}
                    {article.clauses && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {article.clauses.map((clause, cIdx) => (
                          <div key={cIdx} style={{ fontSize: '0.82rem', color: '#374151', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                            {clause}
                          </div>
                        ))}
                      </div>
                    )}

                    {article.table && (
                      <div style={{ marginTop: '10px', overflowX: 'auto' }}>
                        <table style={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          fontSize: '0.76rem',
                          background: '#ffffff',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          border: '1px solid #e5e7eb'
                        }}>
                          <thead>
                            <tr style={{ background: 'rgba(201, 162, 39, 0.12)', color: '#8c6a12' }}>
                              <th style={{ padding: '6px 8px', textAlign: isRtl ? 'right' : 'left', fontWeight: '700' }}>{ui.thLaw}</th>
                              <th style={{ padding: '6px 8px', textAlign: isRtl ? 'right' : 'left', fontWeight: '700' }}>{ui.thArticle}</th>
                              <th style={{ padding: '6px 8px', textAlign: isRtl ? 'right' : 'left', fontWeight: '700' }}>{ui.thPurpose}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {article.table.map((row, rIdx) => (
                              <tr key={rIdx} style={{ borderBottom: '1px solid #f3f4f6', background: rIdx % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                                <td style={{ padding: '6px 8px', fontWeight: '600', color: '#1f2937' }}>{row.law}</td>
                                <td style={{ padding: '6px 8px', color: '#8c6a12', fontWeight: '600' }}>{row.article}</td>
                                <td style={{ padding: '6px 8px', color: '#4b5563', lineHeight: '1.4' }}>{row.purpose}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Footer */}
        <div style={{
          padding: '14px 22px',
          background: 'rgba(255, 255, 255, 0.98)',
          borderTop: '1px solid rgba(201, 162, 39, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: '0.78rem', color: '#6b7280' }}>
            🔒 {ui.lawBadge || 'ORLUXUS Official Verified Digital Contract Record'}
          </span>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={onClose}
              type="button"
              style={{
                background: '#ffffff',
                border: '1px solid #d1d5db',
                color: '#4b5563',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '0.84rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {ui.closeModal}
            </button>

            {onAccept && (
              <button
                onClick={handleAcceptAndClose}
                type="button"
                style={{
                  background: 'linear-gradient(135deg, #c9a227, #aa841a)',
                  border: '1px solid #8c6a12',
                  color: '#ffffff',
                  borderRadius: '8px',
                  padding: '8px 20px',
                  fontSize: '0.86rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(201, 162, 39, 0.35)',
                  transition: 'all 0.2s ease'
                }}
              >
                {ui.acceptBtn}
              </button>
            )}
          </div>
        </div>

        {/* Prevent and block printing */}
        <style jsx global>{`
          @media print {
            .legal-modal-overlay, .legal-modal-container {
              display: none !important;
              visibility: hidden !important;
            }
          }
        `}</style>

      </div>
    </div>
  );
}

