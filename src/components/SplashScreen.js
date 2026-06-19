'use client';

import { useState, useEffect } from 'react';

const INTRO_SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1600&q=80',
    title: 'THE PYRAMIDS OF GIZA',
    subtitle: 'TIMELAND HERITAGE'
  },
  {
    url: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1600&q=80',
    title: 'THE SUNNY NORTH COAST',
    subtitle: 'CRYSTAL BLUE WATERS'
  },
  {
    url: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?auto=format&fit=crop&w=1600&q=80',
    title: 'SHARM EL SHEIKH & SAFARI',
    subtitle: 'DESERT ADVENTURES & WAVES'
  }
];

export default function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const forceSplash = searchParams.get('splash') === 'true';
    const hasViewed = sessionStorage.getItem('orluxus_splash_viewed');

    if (!hasViewed || forceSplash) {
      setVisible(true);

      // Slide Transitions
      const slide1 = setTimeout(() => setActiveIndex(1), 1300);
      const slide2 = setTimeout(() => setActiveIndex(2), 2600);

      // Fade out splash screen
      const fadeTimer = setTimeout(() => {
        setFadeOut(true);
      }, 3900);

      // Fully remove splash screen from DOM
      const removeTimer = setTimeout(() => {
        setVisible(false);
        if (!forceSplash) {
          sessionStorage.setItem('orluxus_splash_viewed', 'true');
        }
      }, 4500);

      return () => {
        clearTimeout(slide1);
        clearTimeout(slide2);
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 999999,
      background: '#0a0e17',
      transition: 'opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
      opacity: fadeOut ? 0 : 1,
      pointerEvents: fadeOut ? 'none' : 'auto',
      overflow: 'hidden',
    }}>
      {/* Background Slides */}
      {INTRO_SLIDES.map((slide, idx) => (
        <div
          key={idx}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(to bottom, rgba(10, 14, 23, 0.4), rgba(10, 14, 23, 0.85)), url(${slide.url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: activeIndex === idx ? 1 : 0,
            transition: 'opacity 0.8s ease-in-out',
            transform: activeIndex === idx ? 'scale(1.05)' : 'scale(1)',
            animation: activeIndex === idx ? 'kenburns 4s ease-out forwards' : 'none',
          }}
        />
      ))}

      {/* Luxury Content Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        zIndex: 10,
        padding: '2rem',
      }}>
        {/* Glow Element */}
        <div style={{
          fontSize: '1rem',
          fontWeight: '700',
          color: '#fbbf24',
          letterSpacing: '6px',
          textTransform: 'uppercase',
          marginBottom: '1rem',
          textShadow: '0 0 10px rgba(251, 191, 36, 0.3)',
          opacity: 0,
          animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}>
          💎 Egypt Luxury
        </div>

        {/* Brand Name */}
        <h1 style={{
          fontSize: 'clamp(3rem, 7vw, 5.5rem)',
          fontWeight: '900',
          background: 'linear-gradient(135deg, #fbbf24 30%, #f59e0b 70%, #d97706 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: 0,
          lineHeight: 1.1,
          fontFamily: 'Inter, sans-serif',
          letterSpacing: '4px',
          filter: 'drop-shadow(0 4px 12px rgba(217, 119, 6, 0.25))',
          opacity: 0,
          animation: 'fadeInScaleUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards',
        }}>
          ORLUXUS
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 'clamp(0.75rem, 2vw, 1rem)',
          fontWeight: '500',
          color: '#e2e8f0',
          letterSpacing: '8px',
          textTransform: 'uppercase',
          marginTop: '0.5rem',
          fontFamily: 'Inter, sans-serif',
          opacity: 0,
          animation: 'fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards',
        }}>
          WITH A FAMILY SPIRIT
        </p>

        {/* Dynamic Image Subtitle description changing per activeIndex */}
        <div style={{
          marginTop: '3rem',
          height: '60px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {INTRO_SLIDES.map((slide, idx) => (
            activeIndex === idx && (
              <div key={idx} style={{
                animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              }}>
                <span style={{
                  color: '#fbbf24',
                  fontSize: '0.75rem',
                  letterSpacing: '4px',
                  fontWeight: '600',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  {slide.subtitle}
                </span>
                <span style={{
                  color: '#ffffff',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  letterSpacing: '2px'
                }}>
                  {slide.title}
                </span>
              </div>
            )
          ))}
        </div>

        {/* Line separator */}
        <div style={{
          width: '60px',
          height: '2px',
          background: 'linear-gradient(to right, transparent, #fbbf24, transparent)',
          marginTop: '2rem',
          opacity: 0,
          animation: 'scaleXIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) 1s forwards',
        }}></div>
      </div>

      <style jsx global>{`
        @keyframes kenburns {
          from { transform: scale(1.05) translate(0, 0); }
          to { transform: scale(1.12) translate(1%, -0.5%); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInScaleUp {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes scaleXIn {
          from {
            opacity: 0;
            transform: scaleX(0);
          }
          to {
            opacity: 1;
            transform: scaleX(1);
          }
        }
      `}</style>
    </div>
  );
}
