import { NextResponse } from 'next/server';
import { getAgentByUsername } from '@/lib/db.firebase';
import { generateAgentToken, buildAgentCookieHeader } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';

/**
 * POST /api/auth/agent-login
 * Server-side agent login with Firebase + fallback to default agents.
 */

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

// Default agents fallback (used if Firebase is empty/not seeded yet)
const DEFAULT_AGENTS = [
  { id: '1', name: 'أحمد محمود',      username: 'ahmed',   password: 'Agent@2026!Sec', tier: 'silver',   status: 'نشط' },
  { id: '2', name: 'سارة إبراهيم',    username: 'sara',    password: 'Agent@2026!Sec', tier: 'gold',     status: 'نشط' },
  { id: '3', name: 'خالد عبد الرحمن', username: 'khaled',  password: 'Agent@2026!Sec', tier: 'silver',   status: 'نشط' },
  { id: '4', name: 'منى جمال',        username: 'mona',    password: 'Agent@2026!Sec', tier: 'bronze',   status: 'موقوف' },
  { id: '5', name: 'طارق زياد',       username: 'tarek',   password: 'Agent@2026!Sec', tier: 'platinum', status: 'نشط' },
  { id: '6', name: 'يوسف سليم',       username: 'youssef', password: 'Agent@2026!Sec', tier: 'bronze',   status: 'نشط' },
  { id: '7', name: 'حازم عمر',        username: 'hazem',   password: 'Agent@2026!Sec', tier: 'bronze',   status: 'نشط' },
];

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

    const cleanUsername = username.trim().toLowerCase();

    // 1) Try Firebase first
    let agent = null;
    try {
      agent = await getAgentByUsername(cleanUsername);
    } catch (e) {
      console.error('Firebase agent lookup failed:', e);
    }

    // 2) Fallback to hardcoded default agents if Firebase returned nothing
    if (!agent) {
      const fallback = DEFAULT_AGENTS.find(a => a.username === cleanUsername);
      if (fallback) agent = { ...fallback };
    }

    if (!agent) {
      return NextResponse.json({ error: 'بيانات الدخول غير صحيحة.' }, { status: 401 });
    }

    // 3) Password verification — bcrypt hash OR plaintext fallback
    const bcrypt = require('bcryptjs');
    let passwordMatch = false;

    if (agent.password && (agent.password.startsWith('$2a$') || agent.password.startsWith('$2b$'))) {
      passwordMatch = await bcrypt.compare(password, agent.password);
    } else {
      passwordMatch = (password === agent.password);
      // Auto-upgrade to bcrypt hash for next login
      if (passwordMatch) {
        try {
          const { updateAgent } = await import('@/lib/db.firebase');
          const salt = await bcrypt.genSalt(10);
          const hashed = await bcrypt.hash(password, salt);
          await updateAgent(agent.id, { password: hashed });
        } catch (e) {
          console.error('Auto-hash upgrade failed:', e);
        }
      }
    }

    if (!passwordMatch) {
      return NextResponse.json({ error: 'بيانات الدخول غير صحيحة.' }, { status: 401 });
    }

    if (agent.status !== 'نشط') {
      return NextResponse.json({ error: 'هذا الحساب موقوف. تواصل مع الإدارة.' }, { status: 403 });
    }

    // 4) Generate signed session token
    const token = generateAgentToken(agent.id);
    const response = NextResponse.json({
      success: true,
      agent: { id: agent.id, name: agent.name, tier: agent.tier },
    });
    response.headers.set('Set-Cookie', buildAgentCookieHeader(token));
    return response;

  } catch (e) {
    console.error('Agent login error:', e);
    return NextResponse.json({ error: 'حدث خطأ أثناء تسجيل الدخول.' }, { status: 500 });
  }
}
