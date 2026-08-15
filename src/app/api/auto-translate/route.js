import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

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

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchTranslation(text, fromCode, toCode, timeoutMs = 8000) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromCode}&tl=${toCode}&dt=t&q=${encodeURIComponent(text)}`;
    
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.error(`Google Translate response not OK for ${toCode}:`, res.status);
      return text;
    }

    const data = await res.json();
    if (data && Array.isArray(data[0])) {
      const translatedText = data[0]
        .filter(item => item && typeof item[0] === 'string')
        .map(item => item[0])
        .join('');

      if (translatedText && translatedText.trim().length > 0) {
        return translatedText;
      }
    }

    return text;
  } catch (err) {
    console.error(`Translation error for ${toCode}:`, err);
    return text; // Fallback to original text on error/timeout
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { text, sourceLang, targetLangs } = body;

    if (!text || typeof text !== 'string' || !text.trim() || !sourceLang) {
      return NextResponse.json({ error: 'Missing required fields: text, sourceLang' }, { status: 400 });
    }

    // Default target languages if not specified (all except source)
    const targets = targetLangs || Object.keys(LANGUAGES).filter(lang => lang !== sourceLang);
    const sourceCode = LANGUAGES[sourceLang] || sourceLang;

    // Run translations with short stagger delays to avoid concurrent rate limiting
    const translations = {};
    
    for (let i = 0; i < targets.length; i++) {
      const targetLang = targets[i];
      const targetCode = LANGUAGES[targetLang] || targetLang;

      if (sourceCode === targetCode) {
        translations[targetLang] = text;
        continue;
      }

      if (i > 0) {
        await delay(120); // 120ms staggered delay
      }

      const translatedText = await fetchTranslation(text, sourceCode, targetCode, 8000);
      translations[targetLang] = translatedText;
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
