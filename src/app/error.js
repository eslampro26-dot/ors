'use client';

import Link from 'next/link';

export default function Error({ error, reset }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      padding: '3rem',
      textAlign: 'center',
      background: 'var(--bg-primary)'
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>Oops!</div>
      <h1 style={{
        fontSize: '2rem',
        fontWeight: '800',
        color: 'var(--text-primary)',
        marginBottom: '1rem'
      }}>
        Something went wrong!
      </h1>
      <p style={{
        color: 'var(--text-secondary)',
        fontSize: '1.1rem',
        lineHeight: '1.6',
        maxWidth: '500px',
        marginBottom: '2rem'
      }}>
        An unexpected error occurred. Please try again or go back to the homepage.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => reset()}
          style={{
            padding: '12px 28px',
            background: 'linear-gradient(135deg, var(--gold-400), var(--gold-700))',
            color: 'white',
            border: 'none',
            borderRadius: '999px',
            fontWeight: 'bold',
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(251, 191, 36, 0.3)'
          }}
        >
          Try Again
        </button>
        <Link
          href="/"
          style={{
            padding: '12px 28px',
            background: 'var(--bg-glass)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-medium)',
            borderRadius: '999px',
            fontWeight: 'bold',
            fontSize: '1rem',
            cursor: 'pointer',
            textDecoration: 'none'
          }}
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
