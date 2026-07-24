'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useSettings } from '@/hooks/useSettings';

// Fallback numbers if DB settings are empty
const DEFAULT_WHATSAPP = '201038820019';

// WhatsApp greeting messages per language
const WA_MESSAGES = {
  ar: 'مرحباً، أريد الاستفسار عن رحلة سياحية',
  en: 'Hello, I would like to inquire about a tour',
  fr: 'Bonjour, je souhaite me renseigner sur un circuit touristique',
  de: 'Hallo, ich möchte mich über eine Reise erkundigen',
  es: 'Hola, me gustaría consultar sobre un viaje turístico',
  it: 'Ciao, vorrei informarmi su un tour turistico',
  ru: 'Здравствуйте, я хотел бы узнать о туристической поездке',
  tr: 'Merhaba, bir turizm turu hakkında bilgi almak istiyorum',
  zh: '您好，我想查询旅游行程',
  ja: 'こんにちは、ツアーについてお問い合わせしたいです',
};

const LABELS = {
  ar:  { support: 'دعم واتساب' },
  en:  { support: 'WhatsApp Support' },
  fr:  { support: 'Support WhatsApp' },
  de:  { support: 'WhatsApp Support' },
  es:  { support: 'Soporte WhatsApp' },
  it:  { support: 'Supporto WhatsApp' },
  ru:  { support: 'Поддержка WhatsApp' },
  tr:  { support: 'WhatsApp Destek' },
  zh:  { support: 'WhatsApp 客服' },
  ja:  { support: 'WhatsApp サポート' },
};

export default function WhatsAppFloatingButton() {
  const [isVisible, setIsVisible] = useState(false);
  const { locale } = useLanguage();
  const { settings } = useSettings();

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide WhatsApp button on admin pages
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/orluxus-management')) {
    return null;
  }

  if (!isVisible) return null;

  const whatsappNum = (settings?.whatsapp || DEFAULT_WHATSAPP).replace(/[^0-9]/g, '');
  const labels = LABELS[locale] || LABELS.en;
  const waMsg = WA_MESSAGES[locale] || WA_MESSAGES.en;
  const waUrl = `https://wa.me/${whatsappNum}?text=${encodeURIComponent(waMsg)}`;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '12px',
      }}
    >
      {/* Direct WhatsApp floating button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={labels.support}
        title={labels.support}
        style={{
          width: '62px',
          height: '62px',
          backgroundColor: '#25D366',
          color: '#FFFFFF',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(0,0,0,0.3), 0 0 20px rgba(37,211,102,0.4)',
          cursor: 'pointer',
          textDecoration: 'none',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.12) rotate(6deg)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
        }}
      >
        <svg viewBox="0 0 24 24" width="34" height="34" fill="currentColor">
          <path d="M12.031 2c-5.523 0-10 4.477-10 10 0 1.777.47 3.5 1.358 5.02L2 22l5.22-1.358C8.71 21.482 10.35 22 12.031 22c5.523 0 10-4.477 10-10s-4.477-10-10-10zm0 1.667c4.593 0 8.333 3.74 8.333 8.333s-3.74 8.333-8.333 8.333c-1.5 0-2.95-.4-4.23-1.16l-.3-.18-3.13.82.82-3.05-.2-.32a8.27 8.27 0 0 1-1.3-4.44c0-4.59 3.74-8.33 8.33-8.33zm-3.86 4.3c-.22 0-.46.06-.66.28-.2.22-.76.74-.76 1.8 0 1.07.78 2.1 1 2.24.11.14 1.54 2.35 3.73 3.3.52.23.93.36 1.25.46.52.17 1 .14 1.37.09.42-.06 1.28-.52 1.46-1.03.18-.51.18-.95.12-1.03-.06-.08-.22-.12-.46-.24-.24-.12-1.46-.72-1.68-.8-.22-.08-.38-.12-.54.12-.16.24-.62.8-.76.95-.14.15-.28.17-.52.05a6.57 6.57 0 0 1-1.92-1.18 7.24 7.24 0 0 1-1.33-1.66c-.14-.24-.02-.37.1-.49.11-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42s-.54-1.3-.74-1.78c-.2-.48-.44-.4-.6-.4z"/>
        </svg>
      </a>
    </div>
  );
}
