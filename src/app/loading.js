
export default function Loading() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      gap: '1.5rem',
      background: 'var(--bg-primary)'
    }}>
      <div style={{
        width: '56px',
        height: '56px',
        border: '3px solid var(--border-subtle)',
        borderTopColor: 'var(--gold-500)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <p style={{
        color: 'var(--text-secondary)',
        fontSize: '0.875rem',
        fontWeight: '600',
        letterSpacing: '2px',
        textTransform: 'uppercase'
      }}>
        Loading ORLUXUS...
      </p>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}
