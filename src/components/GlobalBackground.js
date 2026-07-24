'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const BG_IMAGES = [
  'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1200&q=70',
  'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?auto=format&fit=crop&w=1200&q=70',
  'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=70',
  'https://images.unsplash.com/photo-1600016688773-bc18bf39aa3e?auto=format&fit=crop&w=1200&q=70',
  'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?auto=format&fit=crop&w=1200&q=70',
  'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=1200&q=70',
];

export default function GlobalBackground() {
  const [currentImg, setCurrentImg] = useState(BG_IMAGES[0]);
  const [nextImg, setNextImg] = useState(null);
  const [showNext, setShowNext] = useState(false);
  const indexRef = useRef(0);
  const isMounted = useRef(true);

  const rotateImage = useCallback(() => {
    const nextIdx = (indexRef.current + 1) % BG_IMAGES.length;
    const nextSrc = BG_IMAGES[nextIdx];

    if (!isMounted.current) return;

    indexRef.current = nextIdx;
    setNextImg(nextSrc);
    setTimeout(() => {
      if (!isMounted.current) return;
      setShowNext(true);
    }, 50);

    setTimeout(() => {
      if (!isMounted.current) return;
      setCurrentImg(nextSrc);
      setNextImg(null);
      setShowNext(false);
    }, 2600);
  }, []);

  useEffect(() => {
    isMounted.current = true;
    const isHome =
      window.location.pathname === '/' ||
      window.location.pathname === '/ar' ||
      window.location.pathname === '/en';
    if (!isHome) return;

    const interval = setInterval(rotateImage, 10000);
    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };
  }, [rotateImage]);

  return (
    <div className="global-bg-container">
      {/* Current image — always visible */}
      <div
        className="global-bg-slide active"
        style={{ backgroundImage: `url(${currentImg})` }}
      />
      {/* Next image — fades in over current only when fully loaded */}
      {nextImg && (
        <div
          className={`global-bg-slide${showNext ? ' active' : ''}`}
          style={{ backgroundImage: `url(${nextImg})` }}
        />
      )}
      <div className="global-bg-overlay" />

      {/* Native Browser Preloader - zero garbage collection, zero NS_BINDING_ABORTED */}
      <div style={{ display: 'none', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
        {BG_IMAGES.map((src, i) => (
          <img key={i} src={src} alt="preload" crossOrigin="anonymous" loading="eager" />
        ))}
      </div>

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
          will-change: opacity, transform;
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
          background: radial-gradient(
            circle at 50% 50%,
            transparent 40%,
            var(--bg-primary) 100%
          );
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
