import { NextResponse } from 'next/server';
import { getCookieFromRequest, verifyAgentToken } from '@/lib/auth';
import { getBookings, getAgents, getAgentById, getPromoCodes } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/agent/dashboard
 * Returns the current agent's bookings, stats, sub-agents count, and promo codes.
 * Requires a valid agent_session HttpOnly cookie.
 */
export async function GET(request) {
  try {
    const token = getCookieFromRequest(request, 'agent_session');
    const payload = verifyAgentToken(token);

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agentId = payload.id;

    // Fetch data in parallel
    const [allBookings, agent, allAgents, allPromoCodes] = await Promise.all([
      getBookings(),
      getAgentById(agentId),
      getAgents(),
      getPromoCodes().catch(() => []),
    ]);

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Filter bookings for this agent only (prevent IDOR)
    // Match by agentId OR promoCode belonging to this agent
    const agentPromoCodesFromDb = (allPromoCodes || [])
      .filter(pc => String(pc.agentId) === String(agentId))
      .map(pc => pc.code);

    // Merge agent.promoCodes (array of strings) with DB-queried promo codes
    const mergedPromoCodes = Array.from(new Set([
      ...(agent.promoCodes || []),
      ...agentPromoCodesFromDb,
    ]));

    const myBookings = (allBookings || []).filter(b => {
      const byAgentId = String(b.agentId) === String(agentId);
      const byPromo = b.promoCode && mergedPromoCodes.includes(b.promoCode);
      return byAgentId || byPromo;
    });

    // Count active sub-agents
    const activeSubAgents = (allAgents || []).filter(
      a => String(a.parentId) === String(agentId) && a.status === 'نشط'
    ).length;

    const { password, ...safeAgent } = agent;

    return NextResponse.json({
      agent: { ...safeAgent, promoCodes: mergedPromoCodes },
      bookings: myBookings,
      activeSubAgentsCount: activeSubAgents,
    });
  } catch (e) {
    console.error('agent dashboard error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
