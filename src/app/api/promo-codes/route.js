import { NextResponse } from 'next/server';
import { getPromoCodes, addPromoCode, deletePromoCode, validatePromoCode, consumePromoCode } from '@/lib/db';
import { verifyApiSecret, getCookieFromRequest, verifyAgentToken } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';

function isAdmin(request) {
  return verifyApiSecret(request);
}

function getAgentSession(request) {
  const token = getCookieFromRequest(request, 'agent_session');
  return verifyAgentToken(token);
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const validate = searchParams.get('validate');

    if (validate) {
      const ip = getClientIp(request);

      const rateCheck = await checkRateLimit(ip, 'promo_codes_validate', 10, 10 * 60 * 1000);
      if (!rateCheck.allowed) {
        return NextResponse.json(
          { error: `تم تجاوز الحد الأقصى للمحاولات. يرجى الانتظار ${rateCheck.retryAfter} ثانية.` },
          { status: 429 }
        );
      }

      const result = await validatePromoCode(validate);
      return NextResponse.json(result);
    }

    // Listing all promo codes requires admin authorization
    if (!isAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const codes = await getPromoCodes();
    return NextResponse.json(codes);
  } catch (e) {
    console.error('API Error fetching promo codes:', e);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const ip = getClientIp(request);

    if (body.action === 'validate') {
      const rateCheck = await checkRateLimit(ip, 'promo_codes_validate', 10, 10 * 60 * 1000);
      if (!rateCheck.allowed) {
        return NextResponse.json(
          { error: `تم تجاوز الحد الأقصى للمحاولات. يرجى الانتظار ${rateCheck.retryAfter} ثانية.` },
          { status: 429 }
        );
      }
      const result = await validatePromoCode(body.code);
      return NextResponse.json(result);
    }

    if (body.action === 'use') {
      const rateCheck = await checkRateLimit(ip, 'promo_codes_use', 10, 10 * 60 * 1000);
      if (!rateCheck.allowed) {
        return NextResponse.json(
          { error: `تم تجاوز الحد الأقصى للمحاولات. يرجى الانتظار ${rateCheck.retryAfter} ثانية.` },
          { status: 429 }
        );
      }
      const result = await consumePromoCode(body.code);
      return NextResponse.json({ success: result });
    }

    // Creating a promo code: requires admin or the agent themselves
    const admin = isAdmin(request);
    const agentSession = getAgentSession(request);

    if (!admin && !agentSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // If it's an agent, force their agentId to be their own session ID to prevent IDOR (creating codes for other agents)
    if (!admin && agentSession) {
      body.agentId = String(agentSession.id);
      body.createdBy = 'agent';
    }

    // Basic input validation
    if (!body.code) {
      return NextResponse.json({ error: 'كود الخصم مطلوب.' }, { status: 400 });
    }

    const result = await addPromoCode(body);
    if (result && result.error) {
      return NextResponse.json(result, { status: 400 });
    }
    if (!result) {
      return NextResponse.json({ error: 'Failed to add promo code' }, { status: 500 });
    }
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    console.error('API Error with promo code:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const admin = isAdmin(request);
  const agentSession = getAgentSession(request);

  if (!admin && !agentSession) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { code } = await request.json();
    if (!code) {
      return NextResponse.json({ error: 'Missing code' }, { status: 400 });
    }

    if (!admin && agentSession) {
      // Agent can only delete their own promo code
      const codes = await getPromoCodes();
      const promo = codes.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
      if (!promo || String(promo.agentId) !== String(agentSession.id)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const result = await deletePromoCode(code);
    return NextResponse.json({ success: result });
  } catch (e) {
    console.error('API Error deleting promo code:', e);
    return NextResponse.json({ error: 'Failed to delete promo code' }, { status: 500 });
  }
}

