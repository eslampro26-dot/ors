'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { getMessages, t } from '@/lib/messages';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState('en');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Detect locale from cookie or localStorage
    const savedLocale = localStorage.getItem('orluxus_locale') || 'en';
    setLocaleState(savedLocale);
    setIsReady(true);
  }, []);

  const setLocale = (newLocale) => {
    setLocaleState(newLocale);
    localStorage.setItem('orluxus_locale', newLocale);
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    
    // Update HTML attributes
    document.documentElement.lang = newLocale;
    const direction = ['ar'].includes(newLocale) ? 'rtl' : 'ltr';
    document.documentElement.dir = direction;
    
    const fontFamily = ['ar'].includes(newLocale) ? 'var(--font-ar)' : 'var(--font-en)';
    document.body.style.fontFamily = fontFamily;
    document.body.style.direction = direction;
  };

  const msgs = getMessages(locale);
  const translate = (key, params) => t(msgs, key, params);

  // Avoid hydration mismatches by rendering a wrapper only when ready
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
