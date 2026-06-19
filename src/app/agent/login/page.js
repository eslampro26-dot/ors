'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

/**
 * Agent Login Page
 * Fixes [C-5]: password compared server-side, not in browser JS
 * Fixes [H-1]: session cookie set HttpOnly/Secure by server
 * Fixes [H-2]: sensitive data no longer stored in localStorage
 * Fixes [H-5]: rate limiting enforced on server
 */
export default function AgentLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('الرجاء تعبئة كافة الحقول!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/agent-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'بيانات الدخول غير صحيحة.');
        return;
      }

      // Store only non-sensitive display info in sessionStorage (not localStorage)
      // The real auth token is in an HttpOnly cookie (inaccessible to JS)
      if (data.agent) {
        sessionStorage.setItem('agent_display', JSON.stringify({
          name: data.agent.name,
          tier: data.agent.tier,
        }));
      }

      router.push('/agent');
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
          <img src="/logo.png" alt="ORLUXUS Logo" style={{ height: '60px', margin: '0 auto 1rem' }} />
          <h2>بوابة وكلاء ORLUXUS</h2>
          <p className={styles.subtitle}>سجل دخولك لمتابعة أعمالك وعملائك</p>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        <form onSubmit={handleLogin} className={styles.loginForm}>
          <div className={styles.formGroup}>
            <label>اسم المستخدم (من الإدارة)</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="أدخل اسم المستخدم"
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
            {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
          </button>
        </form>

        <div className={styles.contactAdmin}>
          هل ترغب بالانضمام كوكيل أو نسيت بياناتك؟ <br/>
          <a href="#">تواصل مع الإدارة الآن</a>
        </div>
      </div>
    </div>
  );
}
