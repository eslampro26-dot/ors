'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { getMessages, t } from '@/lib/messages';
import { SUPPORTED_LOCALES } from '@/lib/i18n';

const LanguageContext = createContext(null);

/**
 * Detects the best locale for the user on first visit.
 * Priority: saved localStorage → saved cookie → URL path segment → browser language → 'en'
 * Modified to prioritize user's explicit choice over automatic detection
 */
function detectInitialLocale() {
  if (typeof window === 'undefined') return 'en';

  // 1. Check localStorage first (user's explicit previous choice - highest priority)
  const savedLocale = localStorage.getItem('orluxus_locale');
  if (savedLocale && SUPPORTED_LOCALES.includes(savedLocale)) {
    return savedLocale;
  }

  // 2. Check NEXT_LOCALE cookie
  const cookieMatch = document.cookie.match(/NEXT_LOCALE=([^;]*)/);
  if (cookieMatch && SUPPORTED_LOCALES.includes(cookieMatch[1])) {
    return cookieMatch[1];
  }

  // 3. Check URL path segment (e.g., /ar/packages → 'ar')
  const segments = window.location.pathname.split('/').filter(Boolean);
  if (segments.length > 0 && SUPPORTED_LOCALES.includes(segments[0])) {
    return segments[0];
  }

  // 4. Detect browser/device language (important for mobile users) - only if no explicit choice
  const browserLangs = navigator.languages || [navigator.language || 'en'];
  for (const lang of browserLangs) {
    const base = lang.split('-')[0].toLowerCase(); // e.g., "ar-EG" → "ar"
    if (SUPPORTED_LOCALES.includes(base)) {
      return base;
    }
  }

  // 5. Default to English
  return 'en';
}

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState('en');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const detected = detectInitialLocale();
    setLocaleState(detected);

    // Apply HTML attributes immediately
    const direction = ['ar'].includes(detected) ? 'rtl' : 'ltr';
    document.documentElement.lang = detected;
    document.documentElement.dir = direction;
    document.body.style.direction = direction;
    document.body.style.fontFamily = ['ar'].includes(detected) ? 'var(--font-ar)' : 'var(--font-en)';

    setIsReady(true);
  }, []);

  const setLocale = (newLocale) => {
    if (!SUPPORTED_LOCALES.includes(newLocale)) return;
    
    setLocaleState(newLocale);
    
    // Persist the user's explicit choice
    localStorage.setItem('orluxus_locale', newLocale);
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

    // Update HTML attributes
    const direction = ['ar'].includes(newLocale) ? 'rtl' : 'ltr';
    document.documentElement.lang = newLocale;
    document.documentElement.dir = direction;
    document.documentElement.dataset.locale = newLocale;

    const fontFamily = ['ar'].includes(newLocale) ? 'var(--font-ar)' : 'var(--font-en)';
    document.body.style.fontFamily = fontFamily;
    document.body.style.direction = direction;
  };

  const msgs = getMessages(locale);
  const translate = (key, params) => t(msgs, key, params);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: translate, isReady }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
