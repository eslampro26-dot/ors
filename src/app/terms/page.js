'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CANCELLATION_POLICY_EN, TERMS_AND_CONDITIONS_EN } from '@/lib/legalPoliciesData';

export default function TermsAndCancellationPage() {
  const [activeTab, setActiveTab] = useState('both'); // 'both' | 'terms' | 'cancellation'

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #090d16 0%, #05070c 100%)',
      color: '#e6edf3',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      {/* Top Brand Navigation */}
      <nav className="hide-print" style={{
        padding: '16px 24px',
        background: 'rgba(13, 17, 26, 0.9)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/" style={{ color: '#d4af37', textDecoration: 'none', fontWeight: '900', fontSize: '1.3rem', letterSpacing: '1px' }}>
            ORLUXUS
          </Link>
          <span style={{ color: '#8b949e', fontSize: '0.85rem' }}>| Official Legal Portal</span>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={handlePrint}
            style={{
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.5)',
              color: '#d4af37',
              borderRadius: '8px',
              padding: '6px 16px',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🖨️ Print / Save as PDF
          </button>
          <Link
            href="/"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#fff',
              borderRadius: '8px',
              padding: '6px 16px',
              fontSize: '0.85rem',
              textDecoration: 'none'
            }}
          >
            ← Return to Home
          </Link>
        </div>
      </nav>

      {/* Main Container */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '30px 20px 60px 20px' }}>
        
        {/* Hero Title */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <span style={{
            display: 'inline-block',
            background: 'rgba(212, 175, 55, 0.15)',
            color: '#d4af37',
            padding: '4px 14px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            marginBottom: '8px',
            textTransform: 'uppercase',
            border: '1px solid rgba(212, 175, 55, 0.3)'
          }}>
            Legal &amp; Regulatory Framework
          </span>
          <h1 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.3rem)',
            fontWeight: '900',
            color: '#fff',
            margin: '0 0 10px 0'
          }}>
            ORLUXUS Legal Agreement &amp; Policies
          </h1>
          <p style={{ maxWidth: '750px', margin: '0 auto', color: '#8b949e', fontSize: '0.92rem', lineHeight: '1.6' }}>
            Comprehensive Terms &amp; Conditions and Cancellation &amp; Refund Policy governing all excursions, activities, and bookings arranged via ORLUXUS Marketing &amp; Branding.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="hide-print" style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '25px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setActiveTab('both')}
            style={{
              background: activeTab === 'both' ? 'linear-gradient(135deg, #d4af37, #aa820a)' : 'rgba(255, 255, 255, 0.06)',
              color: activeTab === 'both' ? '#000' : '#fff',
              border: 'none',
              padding: '8px 20px',
              borderRadius: '25px',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            ⚖️ Split View: Both Halves Side-by-Side (صفحة مقسومة جزئين)
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            style={{
              background: activeTab === 'terms' ? 'linear-gradient(135deg, #d4af37, #aa820a)' : 'rgba(255, 255, 255, 0.06)',
              color: activeTab === 'terms' ? '#000' : '#fff',
              border: 'none',
              padding: '8px 20px',
              borderRadius: '25px',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            📜 Part 1: Terms &amp; Conditions Only
          </button>
          <button
            onClick={() => setActiveTab('cancellation')}
            style={{
              background: activeTab === 'cancellation' ? 'linear-gradient(135deg, #d4af37, #aa820a)' : 'rgba(255, 255, 255, 0.06)',
              color: activeTab === 'cancellation' ? '#000' : '#fff',
              border: 'none',
              padding: '8px 20px',
              borderRadius: '25px',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🔄 Part 2: Cancellation Policy Only
          </button>
        </div>

        {/* Dual Split Content */}
        <div style={{
          display: activeTab === 'both' ? 'grid' : 'block',
          gridTemplateColumns: activeTab === 'both' ? 'repeat(auto-fit, minmax(420px, 1fr))' : '1fr',
          gap: '28px',
          alignItems: 'start'
        }}>

          {/* ══════ PART ONE ══════ */}
          {(activeTab === 'both' || activeTab === 'terms') && (
            <div style={{
              background: 'rgba(16, 22, 34, 0.7)',
              borderRadius: '16px',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              padding: '24px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px'
            }}>
              <div style={{ borderBottom: '2px solid #d4af37', paddingBottom: '12px' }}>
                <span style={{
                  background: 'rgba(212, 175, 55, 0.15)',
                  color: '#d4af37',
                  padding: '3px 12px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}>
                  PART ONE (الجزء الأول)
                </span>
                <h2 style={{ margin: '8px 0 4px 0', color: '#fff', fontSize: '1.25rem', fontWeight: '800' }}>
                  {TERMS_AND_CONDITIONS_EN.title}
                </h2>
              </div>

              <div style={{
                background: 'rgba(212, 175, 55, 0.08)',
                borderLeft: '4px solid #d4af37',
                padding: '14px',
                borderRadius: '6px',
                fontSize: '0.84rem',
                lineHeight: '1.6',
                color: '#f0f6fc'
              }}>
                <strong style={{ color: '#d4af37', display: 'block', marginBottom: '4px' }}>
                  ⚠️ IMPORTANT: ELECTRONIC CONSENT &amp; BINDING AGREEMENT
                </strong>
                Please read these Terms and Conditions carefully before using our platform or making a booking. By proceeding, you enter into a legally binding agreement with <strong>ORLUXUS MARKETING AND BRANDING</strong>.
              </div>

              {TERMS_AND_CONDITIONS_EN.sections.map((sec) => (
                <div key={sec.num} style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  padding: '14px'
                }}>
                  <h3 style={{
                    margin: '0 0 8px 0',
                    color: '#d4af37',
                    fontSize: '0.92rem',
                    fontWeight: '700'
                  }}>
                    {sec.title}
                  </h3>
                  <div style={{
                    fontSize: '0.84rem',
                    lineHeight: '1.7',
                    color: '#c9d1d9',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {sec.content}
                  </div>
                </div>
              ))}

              <div style={{
                fontSize: '0.78rem',
                color: '#8b949e',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                paddingTop: '12px'
              }}>
                <strong>{TERMS_AND_CONDITIONS_EN.footer.company}</strong><br />
                {TERMS_AND_CONDITIONS_EN.footer.address}
              </div>
            </div>
          )}

          {/* ══════ PART TWO ══════ */}
          {(activeTab === 'both' || activeTab === 'cancellation') && (
            <div style={{
              background: 'rgba(16, 22, 34, 0.7)',
              borderRadius: '16px',
              border: '1px solid rgba(59, 130, 246, 0.35)',
              padding: '24px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px'
            }}>
              <div style={{ borderBottom: '2px solid #60a5fa', paddingBottom: '12px' }}>
                <span style={{
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: '#60a5fa',
                  padding: '3px 12px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}>
                  PART TWO (الجزء الثاني)
                </span>
                <h2 style={{ margin: '8px 0 4px 0', color: '#fff', fontSize: '1.25rem', fontWeight: '800' }}>
                  {CANCELLATION_POLICY_EN.title}
                </h2>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#8b949e' }}>
                  {CANCELLATION_POLICY_EN.subtitle}
                </p>
              </div>

              <div style={{
                background: 'rgba(59, 130, 246, 0.08)',
                borderLeft: '4px solid #60a5fa',
                padding: '14px',
                borderRadius: '6px',
                fontSize: '0.84rem',
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

              {CANCELLATION_POLICY_EN.articles.map((art) => (
                <div key={art.num} style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  padding: '14px'
                }}>
                  <h3 style={{
                    margin: '0 0 8px 0',
                    color: '#60a5fa',
                    fontSize: '0.92rem',
                    fontWeight: '700'
                  }}>
                    {art.title}
                  </h3>
                  {art.intro && (
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.82rem', color: '#8b949e', fontStyle: 'italic' }}>
                      {art.intro}
                    </p>
                  )}
                  {art.clauses && art.clauses.map((clause, cIdx) => (
                    <div key={cIdx} style={{
                      fontSize: '0.84rem',
                      lineHeight: '1.7',
                      color: '#c9d1d9',
                      marginBottom: '8px',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {clause}
                    </div>
                  ))}

                  {art.table && (
                    <div style={{ marginTop: '14px', overflowX: 'auto' }}>
                      <p style={{ fontSize: '0.8rem', color: '#8b949e', marginBottom: '8px' }}>{art.tableIntro}</p>
                      <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '0.78rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>
                        <thead>
                          <tr style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', textAlign: 'left' }}>
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

              <div style={{
                fontSize: '0.78rem',
                color: '#8b949e',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                paddingTop: '12px'
              }}>
                <strong>{CANCELLATION_POLICY_EN.footer.company}</strong><br />
                {CANCELLATION_POLICY_EN.footer.address}
              </div>
            </div>
          )}

        </div>

        {/* Language Notice */}
        <div style={{
          marginTop: '40px',
          padding: '16px',
          borderRadius: '10px',
          background: 'rgba(212, 175, 55, 0.08)',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          textAlign: 'center',
          color: '#d4af37',
          fontSize: '0.85rem'
        }}>
          * Note on Language: This Agreement and Cancellation Policy are prepared in the Arabic language. In case of translation into English or any other language, the Arabic version shall prevail in the event of any conflict or dispute. (تكون النسخة العربية هي السائدة عند أي نزاع).
        </div>

      </main>
    </div>
  );
}
