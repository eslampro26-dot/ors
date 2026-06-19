'use client';

import { useState } from 'react';

export default function ShareLinkButton() {
  const [status, setStatus] = useState('');

  const copyLink = async () => {
    const link = window.location.href;
    try {
      await navigator.clipboard.writeText(link);
      setStatus('تم نسخ الرابط! شاركه مع صديقك.');
    } catch (error) {
      setStatus('حدث خطأ عند نسخ الرابط. حاول مرة أخرى.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
      <button
        type="button"
        onClick={copyLink}
        style={{
          background: 'var(--gold-400)',
          color: '#07111b',
          border: 'none',
          borderRadius: '999px',
          padding: '1rem 1.75rem',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 16px 40px rgba(255, 215, 0, 0.16)'
        }}
      >
        أرسل رابط للصديق
      </button>
      {status && (
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{status}</span>
      )}
    </div>
  );
}
