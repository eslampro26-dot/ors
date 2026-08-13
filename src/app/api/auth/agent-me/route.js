import { NextResponse } from 'next/server';
import { getCookieFromRequest, verifyAgentToken } from '@/lib/auth';
import { getAgentById, getAgentByUsername } from '@/lib/db';

/**
 * GET /api/auth/agent-me
 * Returns the currently authenticated agent's profile data.
 * Requires a valid agent_session HttpOnly cookie.
 */

export const dynamic = 'force-dynamic';
export async function GET(request) {
  try {
    const token = getCookieFromRequest(request, 'agent_session');
    const payload = verifyAgentToken(token);

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let agent = null;

    // 1. Try lookup by ID first (and verify username matches payload if present)
    if (payload.id) {
      try {
        const byId = await getAgentById(payload.id);
        if (byId) {
          const payloadUser = String(payload.username || '').trim().toLowerCase();
          const agentUser = String(byId.username || '').trim().toLowerCase();
          if (!payloadUser || !agentUser || payloadUser === agentUser) {
            agent = byId;
          }
        }
      } catch (e) {
        console.error('agent-me ID lookup error:', e);
      }
    }

    // 2. Fallback: lookup by username if ID lookup was missing or mismatched
    if (!agent && payload.username) {
      try {
        agent = await getAgentByUsername(payload.username);
      } catch (e) {
        console.error('agent-me username lookup error:', e);
      }
    }

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    if (agent.status === 'موقوف' || agent.status === 'مرفوض') {
      return NextResponse.json({ error: 'Account suspended' }, { status: 403 });
    }

    // Return safe agent data (no password)
    const { password, ...safeAgent } = agent;
    const response = NextResponse.json({ agent: safeAgent });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (e) {
    console.error('agent-me error:', e);
    const response = NextResponse.json({ error: 'Server error' }, { status: 500 });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return response;
  }
}
