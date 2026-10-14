'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function TrustBadges({ variant = 'default', showTitle = true }) {
  const { locale } = useLanguage();
  const isAr = locale === 'ar';

  const badges = [
    {
      icon: '🔒',
      title: isAr ? 'تشفير 256-bit SSL' : 'SSL 256-bit Encrypted',
      desc: isAr ? 'حماية مصرفية فائقة لكافة البيانات' : 'Bank-grade encrypted connection',
    },
    {
      icon: '🛡️',
      title: isAr ? 'مطابق لمعايير PCI DSS' : 'PCI DSS Compliant',
      desc: isAr ? 'أعلى معايير أمان معالجة البطاقات' : 'Strict payment card data standards',
    },
    {
      icon: '💳',
      title: isAr ? 'دفع إلكتروني آمن 100%' : '100% Secure Payments',
      desc: isAr ? 'بوابات دفع معتمدة ومرخصة رسمياً' : 'Authorized & certified payment gateways',
    },
    {
      icon: '🔄',
      title: isAr ? 'استرداد في 7–14 يوم' : 'Refund in 7–14 Days',
      desc: isAr ? 'إرجاع المبالغ على نفس وسيلة الدفع' : 'Direct refund to original payment card',
    },
    {
      icon: '⏱️',
      title: isAr ? 'إلغاء مجاني قبل 24 ساعة' : 'Free Cancellation 24h',
      desc: isAr ? 'مرونة كاملة وضمان استرداد 100%' : 'Full 100% refund without hidden fees',
    },
  ];

  if (variant === 'compact') {
    return (
      <div
        dir={isAr ? 'rtl' : 'ltr'}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '8px',
          padding: '12px 14px',
          background: 'rgba(201, 162, 39, 0.05)',
          border: '1px solid rgba(201, 162, 39, 0.3)',
          borderRadius: '12px',
          margin: '12px 0',
        }}
      >
        {badges.map((b, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{b.icon}</span>
            <div style={{ lineHeight: 1.25 }}>
              <div style={{ fontSize: '0.74rem', fontWeight: '800', color: 'var(--gold-400, #d4aa30)' }}>
                {b.title}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        width: '100%',
        padding: '1.5rem 1rem',
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.85) 0%, rgba(10, 14, 26, 0.95) 100%)',
        borderTop: '1.5px solid rgba(201, 162, 39, 0.35)',
        borderBottom: '1px solid rgba(201, 162, 39, 0.2)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        margin: '1rem 0',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {showTitle && (
          <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
            <span
              style={{
                fontSize: '0.8rem',
                color: 'var(--gold-400, #d4aa30)',
                fontWeight: '800',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(201, 162, 39, 0.1)',
                padding: '4px 14px',
                borderRadius: '20px',
                border: '1px solid rgba(201, 162, 39, 0.25)',
              }}
            >
              🛡️ {isAr ? 'ضمانات الأمان والمصداقية لرحلتك' : 'Our Trust & Security Guarantees'}
            </span>
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '1rem',
            alignItems: 'stretch',
          }}
        >
          {badges.map((b, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(201, 162, 39, 0.2)',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
                textAlign: isAr ? 'right' : 'left',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(201, 162, 39, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  flexShrink: 0,
                  border: '1px solid rgba(201, 162, 39, 0.25)',
                }}
              >
                {b.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '0.84rem',
                    fontWeight: '800',
                    color: 'var(--gold-400, #f6d063)',
                    marginBottom: '2px',
                  }}
                >
                  {b.title}
                </div>
                <div
                  style={{
                    fontSize: '0.72rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    lineHeight: 1.3,
                  }}
                >
                  {b.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
