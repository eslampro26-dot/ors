'use client';

import { useState, useEffect } from 'react';

// ✅ All images are verified Egyptian locations only
const BG_IMAGES = [
  // 1. Great Pyramid of Giza - iconic Egypt
  'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1600&q=80',
  // 2. Hurghada / Red Sea diving reef - Egypt
  'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?auto=format&fit=crop&w=1600&q=80',
  // 3. Luxor Temple at night - Egypt
  'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1600&q=80',
  // 4. Abu Simbel Temple - Aswan, Egypt
  'https://images.unsplash.com/photo-1600016688773-bc18bf39aa3e?auto=format&fit=crop&w=1600&q=80',
  // 5. Nile River cruise boats - Egypt
  'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?auto=format&fit=crop&w=1600&q=80',
  // 6. Egyptian desert landscape / Sahara dunes
  'https://images.unsplash.com/photo-1509884720478-2f5c6e3b3cb2?auto=format&fit=crop&w=1600&q=80',
  // 7. Cairo city & skyline near the Nile
  'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=1600&q=80',
  // 8. Sphinx and pyramids of Giza
  'https://images.unsplash.com/photo-1467579424161-7a13e0e90c49?auto=format&fit=crop&w=1600&q=80',
];

export default function GlobalBackground() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState(new Set([0]));

  // Preload next image before switching
  useEffect(() => {
    const nextIndex = (activeIndex + 1) % BG_IMAGES.length;
    const img = new Image();
    img.src = BG_IMAGES[nextIndex];
    img.onload = () => {
      setLoadedImages((prev) => new Set([...prev, nextIndex]));
    };
  }, [activeIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % BG_IMAGES.length);
    }, 10000); // Change image every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="global-bg-container">
      {BG_IMAGES.map((imgUrl, idx) => (
        <div
          key={idx}
          className={`global-bg-slide ${idx === activeIndex ? 'active' : ''}`}
          style={{
            backgroundImage: loadedImages.has(idx) ? `url(${imgUrl})` : 'none'
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
          opacity: 0.22;
          transform: scale(1.06);
          transition: opacity 2.5s ease-in-out, transform 10s linear;
        }

        [data-theme="dark"] .global-bg-slide.active {
          opacity: 0.13;
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
