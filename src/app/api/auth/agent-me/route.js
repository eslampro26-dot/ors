import { NextResponse } from 'next/server';
import { getCookieFromRequest, verifyAgentToken } from '@/lib/auth';
import { getAgentById } from '@/lib/db';

/**
 * GET /api/auth/agent-me
 * Returns the currently authenticated agent's profile data.
 * Requires a valid agent_session HttpOnly cookie.
 */
export async function GET(request) {
  try {
    const token = getCookieFromRequest(request, 'agent_session');
    const payload = verifyAgentToken(token);

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agent = await getAgentById(payload.id);

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    if (agent.status !== 'نشط') {
      return NextResponse.json({ error: 'Account suspended' }, { status: 403 });
    }

    // Return safe agent data (no password)
    const { password, ...safeAgent } = agent;
    return NextResponse.json({ agent: safeAgent });
  } catch (e) {
    console.error('agent-me error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
