
'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * LazySection Component
 * Phase 4: Performance - Lazy load sections below the fold
 * Uses IntersectionObserver to only render content when visible
 */
export default function LazySection({
  children,
  fallback = null,
  rootMargin = '200px',
  threshold = 0.01,
  className = '',
  style = {},
  id,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // If already visible (e.g., above the fold), skip observer
    if (hasLoaded) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasLoaded(true);
          observer.unobserve(element);
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [rootMargin, threshold, hasLoaded]);

  return (
    <div
      ref={ref}
      id={id}
      className={className}
      style={{
        minHeight: isVisible ? undefined : '100px',
        ...style,
      }}
    >
      {isVisible ? children : fallback}
    </div>
  );
}

/**
 * Skeleton placeholder for lazy-loaded sections
 */
export function SectionSkeleton({ height = '300px' }) {
  return (
    <div
      style={{
        height,
        background: 'linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-secondary) 50%, var(--bg-tertiary) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        borderRadius: '12px',
      }}
    >
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
