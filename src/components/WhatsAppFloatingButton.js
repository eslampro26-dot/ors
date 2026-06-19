'use client';

import { useState, useEffect } from 'react';

export default function WhatsAppFloatingButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('+20100000000');

  useEffect(() => {
    // 1. Fetch settings from API or localStorage
    const loadWhatsappSettings = async () => {
      try {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('orluxus_whatsapp') : null;
        if (saved) {
          setWhatsappNumber(saved);
          return;
        }

        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.settings && data.settings.whatsapp) {
            setWhatsappNumber(data.settings.whatsapp);
          }
        }
      } catch (err) {
        console.error('Error fetching settings for WhatsApp button:', err);
      }
    };
    loadWhatsappSettings();

    // 2. Scroll event listener to show/hide button
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  // Clean the number (remove spaces, plus sign, etc. for the API url)
  const cleanNumber = whatsappNumber.replace(/[^\d+]/g, '');
  const waUrl = `https://wa.me/${cleanNumber.replace('+', '')}`;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float-btn animate-scale-in"
      aria-label="Contact us on WhatsApp"
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        width: '60px',
        height: '60px',
        backgroundColor: '#25D366',
        color: '#FFFFFF',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '32px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3), 0 0 20px rgba(37, 211, 102, 0.4)',
        zIndex: 99999,
        cursor: 'pointer',
        transition: 'transform 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease',
        textDecoration: 'none'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.15) rotate(8deg)';
        e.currentTarget.style.backgroundColor = '#128C7E';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.4), 0 0 30px rgba(37, 211, 102, 0.6)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
        e.currentTarget.style.backgroundColor = '#25D366';
        e.currentTarget.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3), 0 0 20px rgba(37, 211, 102, 0.4)';
      }}
    >
      <svg 
        viewBox="0 0 24 24" 
        width="34" 
        height="34" 
        fill="currentColor"
        style={{ display: 'block' }}
      >
        <path d="M12.031 2c-5.523 0-10 4.477-10 10 0 1.777.47 3.5 1.358 5.02L2 22l5.22-1.358C8.71 21.482 10.35 22 12.031 22c5.523 0 10-4.477 10-10s-4.477-10-10-10zm0 1.667c4.593 0 8.333 3.74 8.333 8.333s-3.74 8.333-8.333 8.333c-1.5 0-2.95-.4-4.23-1.16l-.3-.18-3.13.82.82-3.05-.2-.32a8.27 8.27 0 0 1-1.3-4.44c0-4.59 3.74-8.33 8.33-8.33zm-3.86 4.3c-.22 0-.46.06-.66.28-.2.22-.76.74-.76 1.8 0 1.07.78 2.1 1 2.24.11.14 1.54 2.35 3.73 3.3.52.23.93.36 1.25.46.52.17 1 .14 1.37.09.42-.06 1.28-.52 1.46-1.03.18-.51.18-.95.12-1.03-.06-.08-.22-.12-.46-.24-.24-.12-1.46-.72-1.68-.8-.22-.08-.38-.12-.54.12-.16.24-.62.8-.76.95-.14.15-.28.17-.52.05a6.57 6.57 0 0 1-1.92-1.18 7.24 7.24 0 0 1-1.33-1.66c-.14-.24-.02-.37.1-.49.11-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42s-.54-1.3-.74-1.78c-.2-.48-.44-.4-.6-.4z"/>
      </svg>
    </a>
  );
}
