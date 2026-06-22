import { NextResponse } from 'next/server';
import { getCookieFromRequest, verifyAgentToken } from '@/lib/auth';
import { getAgents, addAgent, addPromoCode } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    // Authenticate parent agent
    const token = getCookieFromRequest(request, 'agent_session');
    const payload = verifyAgentToken(token);

    if (!payload) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول. الرجاء تسجيل الدخول أولاً.' }, { status: 401 });
    }

    const parentAgentId = payload.id;

    // Get request body
    const body = await request.json();
    const { name, email, username, password, promoCode } = body;

    // Validation
    if (!name || !email || !username || !password) {
      return NextResponse.json({ error: 'الرجاء ملء جميع الحقول المطلوبة!' }, { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase();

    // Verify username uniqueness
    const agents = await getAgents();
    const isTaken = (agents || []).some(a => a.username?.toLowerCase() === cleanUsername);
    if (isTaken) {
      return NextResponse.json({ error: 'اسم المستخدم هذا محجوز مسبقاً! الرجاء اختيار اسم مستخدم آخر.' }, { status: 400 });
    }

    // Add sub-agent
    const createdAgent = await addAgent({
      name,
      email,
      username: cleanUsername,
      password,
      tier: 'bronze',
      parentId: parentAgentId,
      status: 'نشط',
    });

    if (!createdAgent) {
      return NextResponse.json({ error: 'فشل إنشاء حساب الوكيل الفرعي.' }, { status: 500 });
    }

    // Add promo code if provided
    if (promoCode && promoCode.trim()) {
      const cleanPromo = promoCode.trim().toUpperCase();
      
      const promoResult = await addPromoCode({
        code: cleanPromo,
        agentId: createdAgent.id,
        discountType: 'percentage',
        discountValue: 10, // Default 10% discount for sub-agents (bronze tier)
        maxUses: 100,
        isActive: true,
        expiryDate: '2026-12-31',
        createdBy: 'agent',
      });

      if (promoResult && promoResult.error) {
        // If promo code creation fails (e.g. already exists), return error
        return NextResponse.json({
          error: `تم إنشاء حساب الوكيل بنجاح، ولكن فشل إنشاء كود الخصم: ${promoResult.error}`,
          agent: { id: createdAgent.id, name: createdAgent.name, username: createdAgent.username },
        }, { status: 201 });
      }
    }

    const { password: _, ...safeAgent } = createdAgent;
    return NextResponse.json(safeAgent, { status: 201 });

  } catch (err) {
    console.error('Error in POST /api/agent/sub-agents:', err);
    return NextResponse.json({ error: 'حدث خطأ في الخادم أثناء إضافة الوكيل الفرعي.' }, { status: 500 });
  }
}
