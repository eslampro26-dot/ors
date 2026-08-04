import { NextResponse } from 'next/server';
import translate from 'google-translate-api-x';

export const dynamic = 'force-dynamic';
export const maxDuration = 15;

// Supported languages mapping
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

// Helper for fast translate with timeout
async function translateWithTimeout(text, fromCode, toCode, timeoutMs = 2500) {
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Translation timeout')), timeoutMs)
    );
    const translationPromise = translate(text, { from: fromCode, to: toCode });
    const result = await Promise.race([translationPromise, timeoutPromise]);
    return result?.text || text;
  } catch (err) {
    return text; // Fallback to original text on error/timeout
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { text, sourceLang, targetLangs } = body;

    if (!text || !sourceLang) {
      return NextResponse.json({ error: 'Missing required fields: text, sourceLang' }, { status: 400 });
    }

    // Default target languages if not specified (all except source)
    const targets = targetLangs || Object.keys(LANGUAGES).filter(lang => lang !== sourceLang);
    const sourceCode = LANGUAGES[sourceLang] || sourceLang;

    // Run all target translations in parallel for maximum speed
    const translationPromises = targets.map(async (targetLang) => {
      const targetCode = LANGUAGES[targetLang] || targetLang;
      if (sourceCode === targetCode) {
        return { targetLang, text };
      }
      const translatedText = await translateWithTimeout(text, sourceCode, targetCode, 2500);
      return { targetLang, text: translatedText };
    });

    const results = await Promise.all(translationPromises);
    const translations = {};
    for (const res of results) {
      translations[res.targetLang] = res.text;
    }

    return NextResponse.json({
      success: true,
      translations,
      sourceText: text,
      sourceLang
    });

  } catch (error) {
    console.error('Auto-translate API error:', error);
    return NextResponse.json({ error: 'Translation failed', success: false, translations: {} }, { status: 200 });
  }
}
