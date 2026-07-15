import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { text, to } = await request.json();
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ translatedText: '' });
    }
    
    const target = to || 'ar';
    if (target === 'en') {
      return NextResponse.json({ translatedText: text });
    }

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
    
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      next: { revalidate: 86400 } // Cache results for 24 hours
    });

    if (!res.ok) {
      console.error('Google Translate response not OK:', res.status);
      return NextResponse.json({ translatedText: text }); // Fallback to original text
    }

    const data = await res.json();
    if (data && data[0]) {
      const translatedText = data[0].map(item => item[0]).join('');
      return NextResponse.json({ translatedText });
    }

    return NextResponse.json({ translatedText: text });
  } catch (error) {
    console.error('[Translation API Error]:', error);
    return NextResponse.json({ translatedText: '' });
  }
}
