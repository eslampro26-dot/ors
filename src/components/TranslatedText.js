'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Component that takes text and translates it to the current locale.
 * Saves translated results in localStorage for instant retrieval.
 * Guaranteed to NEVER render blank text.
 */
export default function TranslatedText({ text, fallback = '', className = '', style = {} }) {
  const { locale } = useLanguage();
  const rawText = text || fallback || '';

  const getCachedTranslation = (txt, loc) => {
    if (!txt || !txt.trim()) return fallback;
    const hasArabic = /[\u0600-\u06FF]/.test(txt);
    if (loc === 'en' && !hasArabic) return txt;
    if (typeof window !== 'undefined') {
      const textHash = simpleHash(txt);
      const cacheKey = `orluxus_tr_${loc}_len${txt.length}_${textHash}`;
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached && cached.trim().length > 0) return cached;
      } catch (e) {}
    }
    return null;
  };

  const [translated, setTranslated] = useState(() => getCachedTranslation(rawText, locale) || rawText);

  useEffect(() => {
    if (!rawText || !rawText.trim()) {
      setTranslated(fallback);
      return;
    }
    
    // If locale is English and text is already non-Arabic, no translation needed
    const hasArabic = /[\u0600-\u06FF]/.test(rawText);
    if (locale === 'en' && !hasArabic) {
      setTranslated(rawText);
      return;
    }

    // Check cache immediately
    const textHash = simpleHash(rawText);
    const cacheKey = `orluxus_tr_${locale}_len${rawText.length}_${textHash}`;

    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached && cached.trim().length > 0) {
        setTranslated(cached);
        return;
      }
    } catch (e) {}

    // Fetch translation immediately without artificial delay
    let isMounted = true;
    fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: rawText, to: locale })
    })
      .then(res => res.ok ? res.json() : {})
      .then(data => {
        if (!isMounted) return;
        if (data && data.translatedText && data.translatedText.trim().length > 0) {
          setTranslated(data.translatedText);
          try {
            localStorage.setItem(cacheKey, data.translatedText);
          } catch (e) {}
        } else {
          setTranslated(rawText);
        }
      })
      .catch(() => {
        if (isMounted) setTranslated(rawText);
      });

    return () => { isMounted = false; };
  }, [rawText, locale, fallback]);

  return <span className={className} style={style}>{translated || rawText}</span>;
}
