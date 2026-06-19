import { NextResponse } from 'next/server';
import { getCookieFromRequest, verifyAgentToken } from '@/lib/auth';
import { getAgents, addAgent, addPromoCode, getAgentById } from '@/lib/db.firebase';

/**
 * GET /api/agent/sub-agents
 * Returns sub-agents tree for the current agent.
 *
 * POST /api/agent/sub-agents
 * Adds a new sub-agent under the current authenticated agent.
 */
export async function GET(request) {
  try {
    const token = getCookieFromRequest(request, 'agent_session');
    const payload = verifyAgentToken(token);

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allAgents = await getAgents();

    // Strip passwords
    const safe = (allAgents || []).map(({ password, ...rest }) => rest);

    return NextResponse.json(safe);
  } catch (e) {
    console.error('agent sub-agents GET error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const token = getCookieFromRequest(request, 'agent_session');
    const payload = verifyAgentToken(token);

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parentId = payload.id;
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.username || !body.password) {
      return NextResponse.json({ error: 'جميع الحقول المطلوبة يجب تعبئتها.' }, { status: 400 });
    }

    // Check username uniqueness
    const allAgents = await getAgents();
    const isTaken = (allAgents || []).some(
      a => a.username.toLowerCase() === body.username.toLowerCase().trim()
    );
    if (isTaken) {
      return NextResponse.json({ error: 'اسم المستخدم محجوز مسبقاً!' }, { status: 409 });
    }

    // Add sub-agent with parentId forced from session (prevents IDOR)
    const newSub = await addAgent({
      name: body.name,
      email: body.email,
      username: body.username.trim().toLowerCase(),
      password: body.password,
      tier: 'bronze',
      parentId: parentId,
      promoCodes: body.promoCode ? [body.promoCode.trim().toUpperCase()] : [],
      status: 'نشط',
    });

    if (!newSub) {
      return NextResponse.json({ error: 'فشل في إضافة الوكيل الفرعي.' }, { status: 500 });
    }

    // Optionally create a promo code for the new sub-agent
    if (body.promoCode && body.promoCode.trim()) {
      const cleanCode = body.promoCode.trim().toUpperCase();
      await addPromoCode({
        code: cleanCode,
        agentId: newSub.id,
        discountType: 'percentage',
        discountValue: 10,
        maxUses: 100,
        isActive: true,
        expiryDate: '2026-12-31',
        createdBy: 'agent',
      });
    }

    const { password, ...safeNewSub } = newSub;
    return NextResponse.json({ success: true, agent: safeNewSub }, { status: 201 });
  } catch (e) {
    console.error('agent sub-agents POST error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
