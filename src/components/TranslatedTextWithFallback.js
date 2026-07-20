'use client';

export default function TranslatedTextWithFallback({ trip, locale }) {
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

  // Use saved translation only, fallback to English, then Arabic
  const availableText = titleMap[locale] || trip.titleEn || trip.titleAr;

  return <span>{availableText}</span>;
}
