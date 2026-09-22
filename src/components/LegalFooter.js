'use client';

import Link from 'next/link';
import { useState } from 'react';

const LEGAL_LINKS = [
  { href: '/terms', labelAr: 'الشروط والأحكام', labelEn: 'Terms & Conditions' },
  { href: '/privacy', labelAr: 'سياسة الخصوصية', labelEn: 'Privacy Policy' },
  { href: '/service-delivery', labelAr: 'سياسة تقديم الخدمة', labelEn: 'Service Delivery' },
  { href: '/terms#cancellation', labelAr: 'سياسة الإلغاء والاسترداد', labelEn: 'Refund & Cancellation' },
];

export default function LegalFooter() {
  const [lang, setLang] = useState('ar');
  const isAr = lang === 'ar';

  return (
    <footer
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        background: 'rgba(10, 14, 26, 0.97)',
        borderTop: '1px solid rgba(201, 162, 39, 0.2)',
        padding: '1.4rem 1.5rem 1rem',
        marginTop: 'auto',
      }}
    >
      {/* Legal Policy Links Row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0.4rem 1.2rem',
          marginBottom: '0.9rem',
        }}
      >
        {LEGAL_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              color: 'rgba(201, 162, 39, 0.85)',
              textDecoration: 'none',
              fontSize: '0.8rem',
              fontWeight: '500',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.target.style.color = '#d4aa30')}
            onMouseLeave={(e) => (e.target.style.color = 'rgba(201, 162, 39, 0.85)')}
          >
            {isAr ? link.labelAr : link.labelEn}
          </Link>
        ))}
      </div>

      {/* PayTabs Security Badges */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.5rem 1.5rem',
          marginBottom: '0.9rem',
          fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.5)',
        }}
      >
        <span>🔒 SSL 256-bit Encrypted</span>
        <span>🛡️ PCI DSS Compliant</span>
        <span>💳 Visa · Mastercard · PayTabs</span>
        <span>🔄 {isAr ? 'استرداد خلال 7-14 يوم عمل' : 'Refund in 7–14 business days'}</span>
      </div>

      {/* Company + Language Switcher */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.5rem 1.5rem',
          fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.35)',
        }}
      >
        <span>
          © {new Date().getFullYear()} ORLUXUS MARKETING AND BRANDING —{' '}
          {isAr ? 'الغردقة، البحر الأحمر، مصر' : 'Hurghada, Red Sea, Egypt'}
        </span>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            onClick={() => setLang('ar')}
            style={{
              background: isAr ? 'rgba(201,162,39,0.2)' : 'transparent',
              color: isAr ? '#d4aa30' : 'rgba(255,255,255,0.35)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.72rem',
              padding: '2px 6px',
              borderRadius: '4px',
            }}
          >
            عربي
          </button>
          <button
            onClick={() => setLang('en')}
            style={{
              background: !isAr ? 'rgba(201,162,39,0.2)' : 'transparent',
              color: !isAr ? '#d4aa30' : 'rgba(255,255,255,0.35)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.72rem',
              padding: '2px 6px',
              borderRadius: '4px',
            }}
          >
            EN
          </button>
        </div>
      </div>
    </footer>
  );
}
