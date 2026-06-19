'use client';

import { useCallback } from 'react';

export default function SkipToContent() {
  const handleFocus = useCallback((e) => {
    e.target.style.top = '0';
  }, []);

  const handleBlur = useCallback((e) => {
    e.target.style.top = '-100%';
  }, []);

  return (
    <a
      href="#main-content"
      style={{
        position: 'absolute',
        top: '-100%',
        left: '0',
        zIndex: 9999,
        padding: '8px 16px',
        background: 'var(--gold-600)',
        color: '#fff',
        fontWeight: 'bold',
        borderRadius: '0 0 8px 0',
        transition: 'top 0.2s',
      }}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      Skip to content
    </a>
  );
}
