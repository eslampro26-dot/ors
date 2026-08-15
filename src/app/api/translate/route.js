import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const LANG_MAP = {
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

// Split long text into chunks at sentence/line boundaries
function splitIntoChunks(text, maxChars = 350) {
  if (!text || text.length <= maxChars) return [text];
  
  const chunks = [];
  let remaining = text.trim();
  
  while (remaining.length > 0) {
    if (remaining.length <= maxChars) {
      chunks.push(remaining);
      break;
    }
    
    let splitAt = maxChars;
    const lastNewline  = remaining.lastIndexOf('\n', maxChars);
    const lastPeriod   = remaining.lastIndexOf('.', maxChars);
    const lastDash     = remaining.lastIndexOf('-', maxChars);
    const lastSpace    = remaining.lastIndexOf(' ', maxChars);
    
    if (lastNewline > maxChars * 0.3)      splitAt = lastNewline + 1;
    else if (lastPeriod > maxChars * 0.3)  splitAt = lastPeriod + 1;
    else if (lastDash > maxChars * 0.3)    splitAt = lastDash;
    else if (lastSpace > maxChars * 0.3)   splitAt = lastSpace;
    
    chunks.push(remaining.substring(0, splitAt).trim());
    remaining = remaining.substring(splitAt).trim();
  }
  
  return chunks.filter(c => c.length > 0);
}

async function translateChunk(text, targetCode) {
  if (!text || !text.trim()) return text;
  try {
    // sl=auto detects source language (English, Arabic, etc.) automatically
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetCode}&dt=t&q=${encodeURIComponent(text)}`;
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
      if (translated && translated.trim().length > 0) return translated;
    }
    return text;
  } catch (err) {
    return text;
  }
}

export async function POST(request) {
  let originalText = '';
  try {
    const { text, to } = await request.json();
    originalText = text || '';
    
    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ translatedText: '' });
    }
    
    const target = to || 'ar';
    const targetCode = LANG_MAP[target] || target;

    if (target === 'en' && /^[a-zA-Z0-9\s.,!?'"()\-:;]+$/.test(text.slice(0, 100))) {
      return NextResponse.json({ translatedText: text });
    }

    const chunks = splitIntoChunks(text, 350);
    
    const translatedChunks = [];
    for (const chunk of chunks) {
      const translated = await translateChunk(chunk, targetCode);
      translatedChunks.push(translated);
    }
    
    const translatedText = translatedChunks.join(' ');
    return NextResponse.json({ translatedText });

  } catch (error) {
    console.error('[Translation API Error]:', error);
    return NextResponse.json({ translatedText: originalText });
  }
}
