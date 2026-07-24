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
  const [translated, setTranslated] = useState(rawText);

  useEffect(() => {
    if (!rawText || !rawText.trim()) {
      setTranslated(fallback);
      return;
    }
    
    // No translation needed for English if already English
    if (locale === 'en') {
      setTranslated(rawText);
      return;
    }

    // Unique cache key combining locale, text length, and text hash
    const textHash = simpleHash(rawText);
    const cacheKey = `orluxus_tr_${locale}_len${rawText.length}_${textHash}`;

    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached && cached.trim().length > 0) {
        setTranslated(cached);
        return;
      }
    } catch (e) {}

    // Stagger API calls randomly to avoid rate-limits
    const delay = 50 + Math.floor(Math.random() * 800);
    const timer = setTimeout(() => {
      fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawText, to: locale })
      })
        .then(res => res.ok ? res.json() : {})
        .then(data => {
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
          setTranslated(rawText);
        });
    }, delay);

    return () => clearTimeout(timer);
  }, [rawText, locale, fallback]);

  return <span className={className} style={style}>{translated || rawText}</span>;
}
