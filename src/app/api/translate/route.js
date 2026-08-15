import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Split long text into chunks at sentence boundaries
function splitIntoChunks(text, maxChars = 400) {
  if (!text || text.length <= maxChars) return [text];
  
  const chunks = [];
  let remaining = text.trim();
  
  while (remaining.length > 0) {
    if (remaining.length <= maxChars) {
      chunks.push(remaining);
      break;
    }
    
    let splitAt = maxChars;
    // Try to split at sentence boundary within maxChars
    const lastPeriod   = remaining.lastIndexOf('.', maxChars);
    const lastNewline  = remaining.lastIndexOf('\n', maxChars);
    const lastDash     = remaining.lastIndexOf('-', maxChars);
    const lastSpace    = remaining.lastIndexOf(' ', maxChars);
    
    if (lastNewline > maxChars * 0.4)      splitAt = lastNewline + 1;
    else if (lastPeriod > maxChars * 0.4)  splitAt = lastPeriod + 1;
    else if (lastDash > maxChars * 0.4)    splitAt = lastDash;
    else if (lastSpace > maxChars * 0.4)   splitAt = lastSpace;
    
    chunks.push(remaining.substring(0, splitAt).trim());
    remaining = remaining.substring(splitAt).trim();
  }
  
  return chunks.filter(c => c.length > 0);
}

async function translateChunk(text, target) {
  if (!text || !text.trim()) return text;
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
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
    if (target === 'en') {
      return NextResponse.json({ translatedText: text });
    }

    // Split long texts into chunks, translate each, then join
    const chunks = splitIntoChunks(text, 400);
    
    const translatedChunks = [];
    for (const chunk of chunks) {
      const translated = await translateChunk(chunk, target);
      translatedChunks.push(translated);
    }
    
    const translatedText = translatedChunks.join(' ');
    return NextResponse.json({ translatedText });

  } catch (error) {
    console.error('[Translation API Error]:', error);
    return NextResponse.json({ translatedText: originalText });
  }
}
