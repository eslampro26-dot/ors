
'use client';

export default function PageLoader({ message = 'Loading...' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: '1.5rem'
    }}>
      {/* Luxury spinner */}
      <div style={{
        width: '48px',
        height: '48px',
        border: '3px solid var(--border-subtle)',
        borderTopColor: 'var(--gold-500)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <p style={{
        color: 'var(--text-secondary)',
        fontSize: 'var(--font-size-sm)',
        fontWeight: '600',
        letterSpacing: '1px',
        textTransform: 'uppercase'
      }}>
        {message}
      </p>
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
