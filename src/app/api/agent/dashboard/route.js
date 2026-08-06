import { NextResponse } from 'next/server';
import { getCookieFromRequest, verifyAgentToken } from '@/lib/auth';
import { getBookings, getAgents, getAgentById, getAgentByUsername, getPromoCodes, getSettings } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/agent/dashboard
 * Returns the current agent's bookings, stats, sub-agents count, promo codes, and admin tier settings.
 * Requires a valid agent_session HttpOnly cookie.
 */
export async function GET(request) {
  try {
    const token = getCookieFromRequest(request, 'agent_session');
    const payload = verifyAgentToken(token);

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch agent - prefer username lookup to prevent wrong account
    let agent = null;
    if (payload.username) {
      try { agent = await getAgentByUsername(payload.username); } catch (_) {}
    }
    if (!agent && payload.id) {
      try { agent = await getAgentById(payload.id); } catch (_) {}
    }

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const agentId = agent.id;

    // Fetch data in parallel
    const [allBookings, allAgents, allPromoCodes, settings] = await Promise.all([
      getBookings(),
      getAgents(),
      getPromoCodes().catch(() => []),
      getSettings().catch(() => ({})),
    ]);

    // Build merged promo codes for this agent (case-insensitive)
    const agentPromoCodesFromDb = (allPromoCodes || [])
      .filter(pc => String(pc.agentId) === String(agentId))
      .map(pc => (pc.code || '').toUpperCase());

    const mergedPromoCodes = Array.from(new Set([
      ...(agent.promoCodes || []).map(c => (c || '').toUpperCase()),
      ...agentPromoCodesFromDb,
    ]));

    // Match bookings by agentId OR promo code (case-insensitive)
    const myBookings = (allBookings || []).filter(b => {
      const byAgentId = b.agentId && (String(b.agentId) === String(agentId) || String(b.agentId) === String(agent.id));
      const byPromo = b.promoCode && mergedPromoCodes.includes(String(b.promoCode).toUpperCase());
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
      tierCommissions: settings.tierCommissions || null,
      tierCriteria: settings.tierCriteria || null,
    });
  } catch (e) {
    console.error('agent dashboard error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
