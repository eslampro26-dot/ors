import { NextResponse } from 'next/server';
import { getAllTrips, updateTrip } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow enough time to process all trips

const LANGUAGES = {
  ar: 'ar',
  en: 'en',
  de: 'de',
  fr: 'fr',
  es: 'es',
  it: 'it',
  ru: 'ru',
  tr: 'tr',
  zh: 'zh-CN',
  ja: 'ja'
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchTranslation(text, fromCode, toCode) {
  if (!text || typeof text !== 'string' || !text.trim()) return '';
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromCode}&tl=${toCode}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!res.ok) return text;

    const data = await res.json();
    if (data && Array.isArray(data[0])) {
      const translated = data[0]
        .filter(item => item && typeof item[0] === 'string')
        .map(item => item[0])
        .join('');
      return translated || text;
    }
    return text;
  } catch (err) {
    console.error(`Error translating to ${toCode}:`, err);
    return text;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { sourceLang = 'en' } = body;

    // Get all trips
    const trips = await getAllTrips();
    
    let translatedCount = 0;
    let failedCount = 0;

    // Translate each trip
    for (const trip of trips) {
      try {
        const sourceTitle = trip.titleEn || trip.titleAr || trip.title;
        const sourceDesc = trip.tripDescriptionEn || trip.tripDescription || trip.description;
        
        if (!sourceTitle) continue;

        const updates = {};
        const sourceCode = LANGUAGES[sourceLang] || sourceLang;

        for (const [lang, langCode] of Object.entries(LANGUAGES)) {
          const capLang = lang.charAt(0).toUpperCase() + lang.slice(1);
          
          // 1. Translate Title
          const titleField = `title${capLang}`;
          if (lang === sourceLang) {
            updates[titleField] = sourceTitle;
          } else if (!trip[titleField] || trip[titleField] === sourceTitle) {
            await delay(100); // 100ms staggering delay
            updates[titleField] = await fetchTranslation(sourceTitle, sourceCode, langCode);
          }

          // 2. Translate Description
          const descField = `tripDescription${capLang}`;
          if (lang === sourceLang) {
            updates[descField] = sourceDesc || '';
          } else if (sourceDesc && (!trip[descField] || trip[descField] === sourceDesc)) {
            await delay(100); // 100ms staggering delay
            updates[descField] = await fetchTranslation(sourceDesc, sourceCode, langCode);
          }
        }

        // Only call update if there are actual updates to save
        if (Object.keys(updates).length > 0) {
          await updateTrip(trip.id, {
            ...trip,
            ...updates
          });
          translatedCount++;
        }

      } catch (err) {
        console.error(`Error translating trip ${trip.id}:`, err);
        failedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed translations for ${translatedCount} trips`,
      translatedCount,
      failedCount,
      totalTrips: trips.length
    });

  } catch (error) {
    console.error('Translate existing trips error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
