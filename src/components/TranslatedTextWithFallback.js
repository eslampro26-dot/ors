'use client';

import { useState, useEffect } from 'react';

export default function TranslatedTextWithFallback({ trip, locale }) {
  const [translatedText, setTranslatedText] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const titleMap = {
    ar: trip.titleAr,
    en: trip.titleEn,
    de: trip.titleDe,
    fr: trip.titleFr,
    es: trip.titleEs,
    it: trip.titleIt,
    ru: trip.titleRu,
    tr: trip.titleTr,
    zh: trip.titleZh,
    ja: trip.titleJa
  };

  // Use saved translation first
  const savedText = titleMap[locale];

  useEffect(() => {
    if (savedText) {
      setTranslatedText(savedText);
      return;
    }

    // If no saved translation, use Google Translate API
    const sourceText = trip.titleEn || trip.titleAr;
    if (!sourceText) return;

    const translateText = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/auto-translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: sourceText,
            sourceLang: trip.titleEn ? 'en' : 'ar',
            targetLangs: [locale]
          })
        });

        const data = await response.json();
        if (data.success && data.translations && data.translations[locale]) {
          setTranslatedText(data.translations[locale]);
        } else {
          setTranslatedText(sourceText);
        }
      } catch (err) {
        console.error('Translation error:', err);
        setTranslatedText(sourceText);
      } finally {
        setIsLoading(false);
      }
    };

    translateText();
  }, [savedText, trip.titleEn, trip.titleAr, locale]);

  if (isLoading) {
    return <span>{trip.titleEn || trip.titleAr}</span>;
  }

  return <span>{translatedText || trip.titleEn || trip.titleAr}</span>;
}
