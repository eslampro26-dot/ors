import { NextResponse } from 'next/server';
import { getAllTrips, updateTrip } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

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

async function translateSingleTrip(trip, sourceLang = 'en') {
  const sourceTitle = trip.titleEn || trip.titleAr || trip.title;
  const sourceDesc = trip.tripDescriptionEn || trip.tripDescription || trip.description;

  if (!sourceTitle) return trip;

  const updates = {};
  const sourceCode = LANGUAGES[sourceLang] || sourceLang;

  const langEntries = Object.entries(LANGUAGES);
  for (let i = 0; i < langEntries.length; i++) {
    const [lang, langCode] = langEntries[i];
    const capLang = lang.charAt(0).toUpperCase() + lang.slice(1);

    if (i > 0) await delay(80);

    // 1. Translate Title
    const titleField = `title${capLang}`;
    if (lang === sourceLang) {
      updates[titleField] = sourceTitle;
    } else if (!trip[titleField] || trip[titleField] === sourceTitle) {
      updates[titleField] = await fetchTranslation(sourceTitle, sourceCode, langCode);
    }

    // 2. Translate Description
    const descField = `tripDescription${capLang}`;
    if (lang === sourceLang) {
      updates[descField] = sourceDesc || '';
    } else if (sourceDesc && (!trip[descField] || trip[descField] === sourceDesc)) {
      updates[descField] = await fetchTranslation(sourceDesc, sourceCode, langCode);
    }
  }

  const updatedTrip = {
    ...trip,
    ...updates
  };

  if (Object.keys(updates).length > 0 && trip.id) {
    await updateTrip(trip.id, updatedTrip);
  }

  return updatedTrip;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { trip, sourceLang = 'en', action } = body;

    // 1. If action is list, return trips list so frontend can iterate
    if (action === 'list') {
      const trips = await getAllTrips();
      return NextResponse.json({
        success: true,
        trips: trips || []
      });
    }

    // 2. If a single trip is provided, translate and save it immediately (Fast & Never times out)
    if (trip && trip.id) {
      const updatedTrip = await translateSingleTrip(trip, sourceLang);
      return NextResponse.json({
        success: true,
        tripId: trip.id,
        trip: updatedTrip
      });
    }

    // 3. Fallback: Process all trips (with safe single loop if called directly)
    const trips = await getAllTrips();
    let translatedCount = 0;

    for (const t of (trips || [])) {
      try {
        await translateSingleTrip(t, sourceLang);
        translatedCount++;
      } catch (err) {
        console.error(`Error translating trip ${t.id}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      translatedCount,
      totalTrips: (trips || []).length
    });

  } catch (error) {
    console.error('Translate API error:', error);
    return NextResponse.json({ error: error.message || 'Translation failed' }, { status: 500 });
  }
}
