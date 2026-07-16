'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

// ✅ Official contact numbers
const WHATSAPP_NUMBER = '201038820019'; // WhatsApp: 01038820019
const EMERGENCY_NUMBER = '01038820014'; // Emergency / Technical Support (call only)

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

// Button labels per language
const LABELS = {
  ar:  { whatsapp: 'واتساب', emergency: 'طوارئ', support: 'دعم واتساب', ariaMain: 'اتصل بنا' },
  en:  { whatsapp: 'WhatsApp', emergency: 'Emergency', support: 'WhatsApp Support', ariaMain: 'Contact us' },
  fr:  { whatsapp: 'WhatsApp', emergency: 'Urgence', support: 'Support WhatsApp', ariaMain: 'Contactez-nous' },
  de:  { whatsapp: 'WhatsApp', emergency: 'Notfall', support: 'WhatsApp Support', ariaMain: 'Kontaktiere uns' },
  es:  { whatsapp: 'WhatsApp', emergency: 'Emergencia', support: 'Soporte WhatsApp', ariaMain: 'Contáctenos' },
  it:  { whatsapp: 'WhatsApp', emergency: 'Emergenza', support: 'Supporto WhatsApp', ariaMain: 'Contattaci' },
  ru:  { whatsapp: 'WhatsApp', emergency: 'Экстренная', support: 'Поддержка WhatsApp', ariaMain: 'Связаться с нами' },
  tr:  { whatsapp: 'WhatsApp', emergency: 'Acil Yardım', support: 'WhatsApp Destek', ariaMain: 'Bize ulaşın' },
  zh:  { whatsapp: 'WhatsApp', emergency: '紧急联系', support: 'WhatsApp 客服', ariaMain: '联系我们' },
  ja:  { whatsapp: 'WhatsApp', emergency: '緊急連絡', support: 'WhatsApp サポート', ariaMain: 'お問い合わせ' },
};

export default function WhatsAppFloatingButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { locale } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  const labels = LABELS[locale] || LABELS.en;
  const waMsg = WA_MESSAGES[locale] || WA_MESSAGES.en;
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMsg)}`;
  const callUrl = `tel:+2${EMERGENCY_NUMBER}`;
  const formattedNumber = EMERGENCY_NUMBER.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3');

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
      {/* Expanded contact menu */}
      {showMenu && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            alignItems: 'flex-end',
            animation: 'slideUpFadeIn 0.25s ease forwards',
          }}
        >
          {/* WhatsApp button */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={`${labels.support} - WhatsApp`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#25D366',
              color: '#fff',
              borderRadius: '50px',
              padding: '10px 18px 10px 14px',
              boxShadow: '0 4px 14px rgba(37, 211, 102, 0.5)',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '14px',
              whiteSpace: 'nowrap',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,211,102,0.7)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,211,102,0.5)';
            }}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M12.031 2c-5.523 0-10 4.477-10 10 0 1.777.47 3.5 1.358 5.02L2 22l5.22-1.358C8.71 21.482 10.35 22 12.031 22c5.523 0 10-4.477 10-10s-4.477-10-10-10zm0 1.667c4.593 0 8.333 3.74 8.333 8.333s-3.74 8.333-8.333 8.333c-1.5 0-2.95-.4-4.23-1.16l-.3-.18-3.13.82.82-3.05-.2-.32a8.27 8.27 0 0 1-1.3-4.44c0-4.59 3.74-8.33 8.33-8.33zm-3.86 4.3c-.22 0-.46.06-.66.28-.2.22-.76.74-.76 1.8 0 1.07.78 2.1 1 2.24.11.14 1.54 2.35 3.73 3.3.52.23.93.36 1.25.46.52.17 1 .14 1.37.09.42-.06 1.28-.52 1.46-1.03.18-.51.18-.95.12-1.03-.06-.08-.22-.12-.46-.24-.24-.12-1.46-.72-1.68-.8-.22-.08-.38-.12-.54.12-.16.24-.62.8-.76.95-.14.15-.28.17-.52.05a6.57 6.57 0 0 1-1.92-1.18 7.24 7.24 0 0 1-1.33-1.66c-.14-.24-.02-.37.1-.49.11-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42s-.54-1.3-.74-1.78c-.2-.48-.44-.4-.6-.4z"/>
            </svg>
            {labels.support}
          </a>

          {/* Emergency / Call button */}
          <a
            href={callUrl}
            title={`${labels.emergency} - ${formattedNumber}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#dc2626',
              color: '#fff',
              borderRadius: '50px',
              padding: '10px 18px 10px 14px',
              boxShadow: '0 4px 14px rgba(220, 38, 38, 0.5)',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '14px',
              whiteSpace: 'nowrap',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(220,38,38,0.7)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(220,38,38,0.5)';
            }}
          >
            {/* Phone icon */}
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
            {labels.emergency}
          </a>
        </div>
      )}

      {/* Main toggle button */}
      <button
        onClick={() => setShowMenu((v) => !v)}
        aria-label={labels.ariaMain}
        style={{
          width: '62px',
          height: '62px',
          backgroundColor: showMenu ? '#1e293b' : '#25D366',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '30px',
          boxShadow: showMenu
            ? '0 4px 14px rgba(0,0,0,0.4)'
            : '0 4px 10px rgba(0,0,0,0.3), 0 0 20px rgba(37,211,102,0.4)',
          cursor: 'pointer',
          transition: 'transform 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease',
          transform: showMenu ? 'rotate(45deg)' : 'rotate(0deg)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = showMenu ? 'rotate(45deg) scale(1.1)' : 'scale(1.12) rotate(8deg)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = showMenu ? 'rotate(45deg)' : 'rotate(0deg)';
        }}
      >
        {showMenu ? (
          // X / Close icon
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          // WhatsApp icon
          <svg viewBox="0 0 24 24" width="34" height="34" fill="currentColor">
            <path d="M12.031 2c-5.523 0-10 4.477-10 10 0 1.777.47 3.5 1.358 5.02L2 22l5.22-1.358C8.71 21.482 10.35 22 12.031 22c5.523 0 10-4.477 10-10s-4.477-10-10-10zm0 1.667c4.593 0 8.333 3.74 8.333 8.333s-3.74 8.333-8.333 8.333c-1.5 0-2.95-.4-4.23-1.16l-.3-.18-3.13.82.82-3.05-.2-.32a8.27 8.27 0 0 1-1.3-4.44c0-4.59 3.74-8.33 8.33-8.33zm-3.86 4.3c-.22 0-.46.06-.66.28-.2.22-.76.74-.76 1.8 0 1.07.78 2.1 1 2.24.11.14 1.54 2.35 3.73 3.3.52.23.93.36 1.25.46.52.17 1 .14 1.37.09.42-.06 1.28-.52 1.46-1.03.18-.51.18-.95.12-1.03-.06-.08-.22-.12-.46-.24-.24-.12-1.46-.72-1.68-.8-.22-.08-.38-.12-.54.12-.16.24-.62.8-.76.95-.14.15-.28.17-.52.05a6.57 6.57 0 0 1-1.92-1.18 7.24 7.24 0 0 1-1.33-1.66c-.14-.24-.02-.37.1-.49.11-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42s-.54-1.3-.74-1.78c-.2-.48-.44-.4-.6-.4z"/>
          </svg>
        )}
      </button>

      <style jsx global>{`
        @keyframes slideUpFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
