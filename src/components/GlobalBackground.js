'use client';

import { useState, useEffect, useRef } from 'react';

const BG_IMAGES = [
  'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1600016688773-bc18bf39aa3e?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1608827434901-a8f0b86e2c06?auto=format&fit=crop&w=1600&q=80',
];

export default function GlobalBackground() {
  const [currentImg, setCurrentImg] = useState(BG_IMAGES[0]);
  const [nextImg, setNextImg] = useState(null);
  const [showNext, setShowNext] = useState(false);
  const indexRef = useRef(0);
  const preloadRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIdx = (indexRef.current + 1) % BG_IMAGES.length;
      indexRef.current = nextIdx;

      // Mount next slide and fade it in
      setNextImg(BG_IMAGES[nextIdx]);
      setTimeout(() => setShowNext(true), 50);

      // After fade completes, swap current and clean up
      setTimeout(() => {
        setCurrentImg(BG_IMAGES[nextIdx]);
        setNextImg(null);
        setShowNext(false);
      }, 2600);
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="global-bg-container">
      {/* Current image - always visible */}
      <div
        className="global-bg-slide active"
        style={{ backgroundImage: `url(${currentImg})` }}
      />
      {/* Next image - fades in over current */}
      {nextImg && (
        <div
          className={`global-bg-slide${showNext ? ' active' : ''}`}
          style={{ backgroundImage: `url(${nextImg})` }}
        />
      )}
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
        }

        .global-bg-slide {
          position: absolute;
          inset: -5%;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          opacity: 0;
          pointer-events: none;
          transform: scale(1.02);
          transition: opacity 2.5s ease-in-out, transform 10s linear;
        }

        .global-bg-slide.active {
          opacity: 0.22;
          transform: scale(1.06);
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
