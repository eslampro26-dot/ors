'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

/**
 * Component that takes English text and automatically translates it
 * to the visitor's current language. Saves translated results in
 * localStorage for instant retrieval on next views.
 */
export default function TranslatedText({ text, fallback = '', className = '', style = {} }) {
  const { locale } = useLanguage();
  const [translated, setTranslated] = useState(text || fallback);

  useEffect(() => {
    if (!text) {
      setTranslated(fallback);
      return;
    }
    
    // No translation needed for English since admin inputs in English
    if (locale === 'en') {
      setTranslated(text);
      return;
    }

    // Quick lookup in localStorage cache (browser-safe key)
    const sanitizedKey = text.slice(0, 60).replace(/[^a-zA-Z0-9]/g, '_');
    const cacheKey = `orluxus_tr_${locale}_${sanitizedKey}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setTranslated(cached);
        return;
      }
    } catch (e) {}

    // Call the translation API
    fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, to: locale })
    })
      .then(res => res.ok ? res.json() : {})
      .then(data => {
        if (data.translatedText) {
          setTranslated(data.translatedText);
          try {
            localStorage.setItem(cacheKey, data.translatedText);
          } catch (e) {}
        }
      })
      .catch(() => {
        setTranslated(text);
      });
  }, [text, locale, fallback]);

  return <span className={className} style={style}>{translated}</span>;
}
