import { NextResponse } from 'next/server';
import { getAllTrips, updateTrip } from '@/lib/db';
import translate from 'google-translate-api-x';

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
        const sourceText = trip.titleEn || trip.titleAr;
        if (!sourceText) continue;

        const translations = {};
        const sourceCode = LANGUAGES[sourceLang] || sourceLang;

        // Translate to all target languages except source
        for (const [lang, langCode] of Object.entries(LANGUAGES)) {
          if (lang === sourceLang) continue;

          try {
            if (sourceCode === langCode) {
              translations[`title${lang.charAt(0).toUpperCase() + lang.slice(1)}`] = sourceText;
              continue;
            }

            const result = await translate(sourceText, { from: sourceCode, to: langCode });
            translations[`title${lang.charAt(0).toUpperCase() + lang.slice(1)}`] = result.text;
          } catch (err) {
            console.error(`Translation error for ${lang}:`, err);
            translations[`title${lang.charAt(0).toUpperCase() + lang.slice(1)}`] = sourceText;
          }
        }

        // Update trip with translations
        await updateTrip(trip.id, translations);
        translatedCount++;

      } catch (err) {
        console.error(`Error translating trip ${trip.id}:`, err);
        failedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Translated ${translatedCount} trips successfully`,
      translatedCount,
      failedCount,
      totalTrips: trips.length
    });

  } catch (error) {
    console.error('Translate existing trips error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
