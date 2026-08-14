import { NextResponse } from 'next/server';
import { getServiceReviews, addServiceReview } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/service-reviews?serviceId=xxx
 * Returns all verified reviews for a specific service/trip.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');

    if (!serviceId) {
      return NextResponse.json({ error: 'serviceId is required' }, { status: 400 });
    }

    const reviews = await getServiceReviews(serviceId);
    return NextResponse.json(reviews || []);
  } catch (e) {
    console.error('[service-reviews GET] Error:', e);
    return NextResponse.json([], { status: 500 });
  }
}

/**
 * POST /api/service-reviews
 * Body: { serviceId, userId, userName, userPhoto, userEmail, rating, comment }
 * Adds or updates a verified review for a service (one per user per service).
 */
export async function POST(request) {
  try {
    const body = await request.json();

    const { serviceId, userId, userName, userPhoto, userEmail, rating, comment } = body;

    // Validation
    if (!serviceId || typeof serviceId !== 'string') {
      return NextResponse.json({ error: 'serviceId مطلوب.' }, { status: 400 });
    }
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً.' }, { status: 401 });
    }
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'التقييم يجب أن يكون بين 1 و5 نجوم.' }, { status: 400 });
    }
    if (!comment || typeof comment !== 'string' || comment.trim().length < 5) {
      return NextResponse.json({ error: 'الرجاء كتابة تعليق (5 أحرف على الأقل).' }, { status: 400 });
    }
    if (comment.trim().length > 1000) {
      return NextResponse.json({ error: 'التعليق طويل جداً (الحد الأقصى 1000 حرف).' }, { status: 400 });
    }

    const result = await addServiceReview({
      serviceId: serviceId.trim(),
      userId: userId.trim(),
      userName: (userName || 'Anonymous').trim().slice(0, 100),
      userPhoto: (userPhoto || '').trim(),
      userEmail: (userEmail || '').trim().slice(0, 200),
      rating: Math.round(rating),
      comment: comment.trim().slice(0, 1000),
    });

    if (!result) {
      return NextResponse.json({ error: 'فشل في حفظ التقييم.' }, { status: 500 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    console.error('[service-reviews POST] Error:', e);
    return NextResponse.json({ error: 'حدث خطأ أثناء حفظ التقييم.' }, { status: 500 });
  }
}
