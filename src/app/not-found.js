import Link from 'next/link';

export default function NotFound() {
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
      <div style={{ fontSize: '6rem', fontWeight: '900', marginBottom: '1rem', background: 'linear-gradient(135deg, var(--gold-400), var(--gold-700))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>404</div>
      <h1 style={{
        fontSize: '2rem',
        fontWeight: '800',
        color: 'var(--text-primary)',
        marginBottom: '1rem'
      }}>
        Page Not Found
      </h1>
      <p style={{
        color: 'var(--text-secondary)',
        fontSize: '1.1rem',
        lineHeight: '1.6',
        maxWidth: '500px',
        marginBottom: '2rem'
      }}>
        The page you are looking for does not exist or has been moved. Let us take you back home.
      </p>
      <Link
        href="/"
        style={{
          padding: '12px 28px',
          background: 'linear-gradient(135deg, var(--gold-400), var(--gold-700))',
          color: 'white',
          border: 'none',
          borderRadius: '999px',
          fontWeight: 'bold',
          fontSize: '1rem',
          cursor: 'pointer',
          textDecoration: 'none',
          boxShadow: '0 4px 15px rgba(251, 191, 36, 0.3)'
        }}
      >
        Back to Home
      </Link>
    </div>
  );
}
