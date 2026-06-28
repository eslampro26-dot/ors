
import { NextResponse } from 'next/server';
import { getReviews, addReview } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';

/**
 * Reviews API
 * Fixes [M-4]: Input validation added to POST endpoint.
 * GET is intentionally public (reviews are visible to all visitors).
 */

export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const reviews = await getReviews();
    return NextResponse.json(reviews);
  } catch (e) {
    return NextResponse.json([], { status: 500 });
  }
}

const MAX_REVIEWS = 3;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

export async function POST(request) {
  try {
    const ip = getClientIp(request);

    const rateCheck = await checkRateLimit(ip, 'reviews', MAX_REVIEWS, WINDOW_MS);
    if (!rateCheck.allowed) {
      const retryAfterMin = Math.ceil(rateCheck.retryAfter / 60);
      return NextResponse.json(
        { error: `تم تجاوز الحد الأقصى للمراجعات المسموح بها. الرجاء الانتظار ${retryAfterMin} دقيقة قبل إضافة مراجعة أخرى.` },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Input validation
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2) {
      return NextResponse.json({ error: 'الاسم مطلوب (على الأقل حرفان).' }, { status: 400 });
    }
    if (!body.text || typeof body.text !== 'string' || body.text.trim().length < 10) {
      return NextResponse.json({ error: 'نص المراجعة مطلوب (على الأقل 10 أحرف).' }, { status: 400 });
    }
    if (body.text.trim().length > 1000) {
      return NextResponse.json({ error: 'نص المراجعة طويل جداً (الحد الأقصى 1000 حرف).' }, { status: 400 });
    }
    if (typeof body.rating !== 'number' || body.rating < 1 || body.rating > 5) {
      return NextResponse.json({ error: 'التقييم يجب أن يكون بين 1 و5.' }, { status: 400 });
    }

    const sanitized = {
      name:    body.name.trim().slice(0, 100),
      country: body.country ? String(body.country).trim().slice(0, 50) : '',
      text:    body.text.trim().slice(0, 1000),
      rating:  Math.round(body.rating),
      image:   body.image ? String(body.image) : '',
    };

    const result = await addReview(sanitized);
    if (!result) {
      return NextResponse.json({ error: 'Failed to add review' }, { status: 500 });
    }
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to add review' }, { status: 500 });
  }
}
