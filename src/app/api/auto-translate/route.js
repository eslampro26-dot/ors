import { NextResponse } from 'next/server';
import translate from 'google-translate-api-x';

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

export async function POST(request) {
  try {
    const body = await request.json();
    const { text, sourceLang, targetLangs } = body;

    if (!text || !sourceLang) {
      return NextResponse.json({ error: 'Missing required fields: text, sourceLang' }, { status: 400 });
    }

    // Default target languages if not specified (all except source)
    const targets = targetLangs || Object.keys(LANGUAGES).filter(lang => lang !== sourceLang);

    const translations = {};
    const sourceCode = LANGUAGES[sourceLang] || sourceLang;

    // Translate to each target language
    for (const targetLang of targets) {
      try {
        const targetCode = LANGUAGES[targetLang] || targetLang;
        
        if (sourceCode === targetCode) {
          translations[targetLang] = text;
          continue;
        }

        const result = await translate(text, { from: sourceCode, to: targetCode });
        translations[targetLang] = result.text;
      } catch (err) {
        console.error(`Translation error for ${targetLang}:`, err);
        translations[targetLang] = text; // Fallback to original text
      }
    }

    return NextResponse.json({
      success: true,
      translations,
      sourceText: text,
      sourceLang
    });

  } catch (error) {
    console.error('Auto-translate API error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
