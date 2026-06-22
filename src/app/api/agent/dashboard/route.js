import { NextResponse } from 'next/server';
import { getCookieFromRequest, verifyAgentToken } from '@/lib/auth';
import { getBookings, getAgents, getAgentById } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/agent/dashboard
 * Returns the current agent's bookings, stats, and sub-agents count.
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
    const [allBookings, agent, allAgents] = await Promise.all([
      getBookings(),
      getAgentById(agentId),
      getAgents(),
    ]);

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Filter bookings for this agent only (prevent IDOR)
    const myBookings = (allBookings || []).filter(
      b => String(b.agentId) === String(agentId)
    );

    // Count active sub-agents
    const activeSubAgents = (allAgents || []).filter(
      a => String(a.parentId) === String(agentId) && a.status === 'نشط'
    ).length;

    const { password, ...safeAgent } = agent;

    return NextResponse.json({
      agent: safeAgent,
      bookings: myBookings,
      activeSubAgentsCount: activeSubAgents,
    });
  } catch (e) {
    console.error('agent dashboard error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
