'use client';

import { useState, useEffect } from 'react';

const BG_IMAGES = [
  'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1600&q=80', // Pyramids
  'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1600&q=80', // Hurghada / Coast
  'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1600&q=80', // Luxor Temple
  'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1600&q=80'  // Sharm Reef / Marine
];

export default function GlobalBackground() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % BG_IMAGES.length);
    }, 12000); // Change image every 12 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="global-bg-container">
      {BG_IMAGES.map((imgUrl, idx) => (
        <div
          key={idx}
          className={`global-bg-slide ${idx === activeIndex ? 'active' : ''}`}
          style={{
            backgroundImage: `url(${imgUrl})`
          }}
        />
      ))}
      <div className="global-bg-overlay" />

      <style jsx global>{`
        .global-bg-container {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          z-index: -100;
          overflow: hidden;
          pointer-events: none;
          background-color: var(--bg-primary);
          transition: background-color 0.5s ease;
        }

        .global-bg-slide {
          position: absolute;
          inset: -5%;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          opacity: 0;
          transition: opacity 2.5s ease-in-out;
          pointer-events: none;
          transform: scale(1.02);
        }

        .global-bg-slide.active {
          opacity: 0.07; /* 7% opacity in light mode */
          transform: scale(1.06);
          transition: opacity 2.5s ease-in-out, transform 12s linear;
        }

        [data-theme="dark"] .global-bg-slide.active {
          opacity: 0.04; /* 4% opacity in dark mode */
        }

        .global-bg-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 50%, transparent 40%, var(--bg-primary) 100%);
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
