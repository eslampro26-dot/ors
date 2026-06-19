import { NextResponse } from 'next/server';
import { getCookieFromRequest, verifyAgentToken } from '@/lib/auth';
import { getAgentById } from '@/lib/db';

/**
 * GET /api/auth/agent-me
 * Returns the currently authenticated agent's profile data.
 * Requires a valid agent_session HttpOnly cookie.
 */

// Fallback default agents (same as agent-login)
const DEFAULT_AGENTS = [
  { id: '1', name: 'أحمد محمود',      username: 'ahmed',   tier: 'silver',   status: 'نشط', email: 'ahmed@orluxus.com', joinDate: '2025-01-01', sales: 0, promoCodes: ['AHMED10'] },
  { id: '2', name: 'سارة إبراهيم',    username: 'sara',    tier: 'gold',     status: 'نشط', email: 'sara@orluxus.com',  joinDate: '2025-01-01', sales: 0, promoCodes: ['SARA15'] },
  { id: '3', name: 'خالد عبد الرحمن', username: 'khaled',  tier: 'silver',   status: 'نشط', email: 'khaled@orluxus.com',joinDate: '2025-01-01', sales: 0, promoCodes: ['KHALED10'] },
  { id: '4', name: 'منى جمال',        username: 'mona',    tier: 'bronze',   status: 'موقوف',email: 'mona@orluxus.com', joinDate: '2025-01-01', sales: 0, promoCodes: [] },
  { id: '5', name: 'طارق زياد',       username: 'tarek',   tier: 'platinum', status: 'نشط', email: 'tarek@orluxus.com', joinDate: '2025-01-01', sales: 0, promoCodes: ['TAREK20'] },
  { id: '6', name: 'يوسف سليم',       username: 'youssef', tier: 'bronze',   status: 'نشط', email: 'youssef@orluxus.com',joinDate: '2025-01-01', sales: 0, promoCodes: ['YOUSSEF10'] },
  { id: '7', name: 'حازم عمر',        username: 'hazem',   tier: 'bronze',   status: 'نشط', email: 'hazem@orluxus.com', joinDate: '2025-01-01', sales: 0, promoCodes: [] },
];

export async function GET(request) {
  try {
    const token = getCookieFromRequest(request, 'agent_session');
    const payload = verifyAgentToken(token);

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try Firebase first
    let agent = null;
    try {
      agent = await getAgentById(payload.id);
    } catch (e) {
      console.error('agent-me Firebase error:', e);
    }

    // Fallback to default agents list
    if (!agent) {
      agent = DEFAULT_AGENTS.find(a => a.id === String(payload.id));
    }

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
