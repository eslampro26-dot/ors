'use client';

import { useState, useEffect } from 'react';

function simpleHash(str) {
  if (!str) return '0';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function getStoredTranslation(trip, locale) {
  if (!trip) return '';

  // 1. Direct language properties on trip object
  const titleMap = {
    ar: trip.titleAr,
    en: trip.titleEn,
    de: trip.titleDe || trip.titles?.de,
    fr: trip.titleFr || trip.titles?.fr,
    es: trip.titleEs || trip.titles?.es,
    it: trip.titleIt || trip.titles?.it,
    ru: trip.titleRu || trip.titles?.ru,
    tr: trip.titleTr || trip.titles?.tr,
    zh: trip.titleZh || trip.titles?.zh,
    ja: trip.titleJa || trip.titles?.ja
  };

  const direct = titleMap[locale];
  if (direct && typeof direct === 'string' && direct.trim().length > 0) {
    return direct;
  }

  // 2. Check localStorage cache
  if (typeof window !== 'undefined') {
    const sourceText = trip.titleEn || trip.titleAr || '';
    if (sourceText) {
      const cacheKey = `orluxus_trip_title_${trip.id || 'x'}_${locale}_${simpleHash(sourceText)}`;
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached && cached.trim().length > 0) {
          return cached;
        }
      } catch (e) {}
    }
  }

  return null;
}

export default function TranslatedTextWithFallback({ trip, locale }) {
  const fallbackText = trip?.titleEn || trip?.titleAr || '';

  const [translatedText, setTranslatedText] = useState(fallbackText);

  useEffect(() => {
    const directOrCached = getStoredTranslation(trip, locale);
    if (directOrCached) {
      setTranslatedText(directOrCached);
      return;
    }

    const sourceText = trip?.titleEn || trip?.titleAr;
    if (!sourceText || locale === 'en' || (locale === 'ar' && trip?.titleAr)) {
      setTranslatedText(sourceText || '');
      return;
    }

    const cacheKey = `orluxus_trip_title_${trip?.id || 'x'}_${locale}_${simpleHash(sourceText)}`;

    let isMounted = true;
    fetch('/api/auto-translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: sourceText,
        sourceLang: trip?.titleEn ? 'en' : 'ar',
        targetLangs: [locale]
      })
    })
      .then(res => res.ok ? res.json() : {})
      .then(data => {
        if (!isMounted) return;
        if (data && data.success && data.translations && data.translations[locale]) {
          const result = data.translations[locale];
          setTranslatedText(result);
          try {
            localStorage.setItem(cacheKey, result);
          } catch (e) {}
        } else {
          setTranslatedText(sourceText);
        }
      })
      .catch(() => {
        if (isMounted) setTranslatedText(sourceText);
      });

    return () => { isMounted = false; };
  }, [trip, locale]);

  return <span>{translatedText || fallbackText}</span>;
}

