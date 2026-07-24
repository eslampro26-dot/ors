import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

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

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
    
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      next: { revalidate: 86400 }
    });

    if (!res.ok) {
      console.error('Google Translate response not OK:', res.status);
      return NextResponse.json({ translatedText: text });
    }

    const data = await res.json();
    if (data && Array.isArray(data[0])) {
      const translatedText = data[0]
        .filter(item => item && typeof item[0] === 'string')
        .map(item => item[0])
        .join('');

      if (translatedText && translatedText.trim().length > 0) {
        return NextResponse.json({ translatedText });
      }
    }

    return NextResponse.json({ translatedText: text });
  } catch (error) {
    console.error('[Translation API Error]:', error);
    return NextResponse.json({ translatedText: originalText });
  }
}
