
'use client';

import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: theme === 'dark' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(15, 23, 42, 0.08)',
        border: theme === 'dark' ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid rgba(15, 23, 42, 0.12)',
        cursor: 'pointer',
        fontSize: '1.2rem',
        transition: 'all 0.3s ease',
        boxShadow: theme === 'dark' ? '0 0 12px rgba(251, 191, 36, 0.1)' : 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1) rotate(15deg)';
        e.currentTarget.style.boxShadow = theme === 'dark'
          ? '0 0 20px rgba(251, 191, 36, 0.3)'
          : '0 0 15px rgba(59, 130, 246, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
        e.currentTarget.style.boxShadow = theme === 'dark'
          ? '0 0 12px rgba(251, 191, 36, 0.1)'
          : 'none';
      }}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
