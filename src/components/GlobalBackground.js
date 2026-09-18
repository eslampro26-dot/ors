'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';

const BG_IMAGES = [
  'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=1920&q=85',
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
      {/* Current Hero Image using next/image with priority={true} & quality={85} for ultra-fast LCP */}
      <div className="global-bg-slide active">
        <Image
          src={currentImg}
          alt="ORLUXUS Hero Experience"
          fill
          priority={true}
          quality={85}
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
        />
      </div>

      {/* Next image for smooth cross-fade */}
      {nextImg && (
        <div className={`global-bg-slide${showNext ? ' active' : ''}`}>
          <Image
            src={nextImg}
            alt="ORLUXUS Luxury Destination"
            fill
            quality={85}
            sizes="100vw"
            style={{ objectFit: 'cover', objectPosition: 'center' }}
          />
        </div>
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
          inset: -2%;
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
