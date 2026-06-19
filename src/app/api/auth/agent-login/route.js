import { NextResponse } from 'next/server';
import { getAgentByUsername } from '@/lib/db.firebase';
import { generateAgentToken, buildAgentCookieHeader } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';

/**
 * POST /api/auth/agent-login
 * Server-side agent login.
 * Fixes: [C-5] Plaintext password comparison, [H-1] Insecure cookies,
 *         [H-5] No rate limiting
 */

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(request) {
  try {
    const ip = getClientIp(request);

    const rateCheck = await checkRateLimit(ip, 'agent_login', MAX_ATTEMPTS, WINDOW_MS);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `تم تجاوز الحد الأقصى لمحاولات الدخول. انتظر ${rateCheck.retryAfter} ثانية.` },
        { status: 429, headers: { 'Retry-After': String(rateCheck.retryAfter) } }
      );
    }

    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'الرجاء تعبئة كافة الحقول.' }, { status: 400 });
    }

    // Look up agent on server side
    const agent = await getAgentByUsername(username.trim());

    if (!agent) {
      return NextResponse.json({ error: 'بيانات الدخول غير صحيحة.' }, { status: 401 });
    }

    // Secure verification (C-5): Enforce bcrypt comparison (no plaintext fallback)
    const bcrypt = require('bcryptjs');
    const passwordMatch = await bcrypt.compare(password, agent.password);

    if (!passwordMatch) {
      return NextResponse.json({ error: 'بيانات الدخول غير صحيحة.' }, { status: 401 });
    }

    if (agent.status !== 'نشط') {
      return NextResponse.json({ error: 'هذا الحساب موقوف. تواصل مع الإدارة.' }, { status: 403 });
    }

    // Generate signed token and set HttpOnly cookie
    const token = generateAgentToken(agent.id);

    const response = NextResponse.json({
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        tier: agent.tier,
      },
    });
    response.headers.set('Set-Cookie', buildAgentCookieHeader(token));
    return response;
  } catch (e) {
    return NextResponse.json({ error: 'حدث خطأ أثناء تسجيل الدخول.' }, { status: 500 });
  }
}

