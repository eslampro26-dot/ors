'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

/**
 * Admin Login Page
 * Fixes [C-1]: credentials verified server-side via /api/auth/admin-login
 * Fixes [C-3]: no client-side cookie manipulation
 * Fixes [H-1]: session cookie is HttpOnly/Secure (set by server)
 * Fixes [H-5]: rate limiting enforced on server
 */
export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('الرجاء تعبئة جميع الحقول.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
        credentials: 'include', // ensure cookie is stored
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'بيانات الدخول غير صحيحة.');
        return;
      }

      // Cookie is set server-side (HttpOnly) — no document.cookie manipulation
      router.push('/orluxus-management');
    } catch {
      setError('تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={`${styles.loginCard} glass-card animate-scale-in`}>
        <div className={styles.logoArea}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem', lineHeight: 1.2 }}>
            <span style={{ fontFamily: 'var(--font-en)', fontSize: '2rem', fontWeight: 700, background: 'var(--gradient-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ORLUXUS</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-en)' }}>WITH A FAMILY SPIRIT</span>
          </div>
          <h2>الإدارة العليا | ORLUXUS</h2>
          <p className={styles.subtitle}>الوصول مقصور على الإدارة فقط</p>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        <form onSubmit={handleLogin} className={styles.loginForm}>
          <div className={styles.formGroup}>
            <label>اسم المستخدم</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Admin Username"
              required
              autoComplete="username"
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label>كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className={styles.input}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'جاري التحقق...' : 'دخول آمن'}
          </button>
        </form>
      </div>
    </div>
  );
}
