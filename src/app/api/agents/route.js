import { NextResponse } from 'next/server';
import { getAgents, addAgent, updateAgent, deleteAgent, saveAgents } from '@/lib/db';
import { verifyApiSecret } from '@/lib/auth';

/**
 * Fixes [C-4]: All API routes now require admin authentication.
 * Requests must include a valid admin_session cookie OR x-api-secret header.
 */

export const dynamic = 'force-dynamic';

export async function GET(request) {
  if (!verifyApiSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const agents = await getAgents();
    // Strip passwords before sending to client (C-2 mitigation)
    const safe = agents.map(({ password, ...rest }) => rest);
    return NextResponse.json(safe);
  } catch (e) {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request) {
  if (!verifyApiSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    // Basic input validation
    if (!body.name || !body.username || !body.email) {
      return NextResponse.json({ error: 'بيانات ناقصة.' }, { status: 400 });
    }
    const result = await addAgent(body);
    if (!result) {
      return NextResponse.json({ error: 'Failed to add agent' }, { status: 500 });
    }
    const { password, ...safe } = result;
    return NextResponse.json(safe, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to add agent' }, { status: 500 });
  }
}

export async function PUT(request) {
  if (!verifyApiSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    if (body.bulk && Array.isArray(body.agents)) {
      const result = await saveAgents(body.agents);
      return NextResponse.json({ success: result });
    }
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const result = await updateAgent(id, data);
    return NextResponse.json({ success: result });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!verifyApiSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const result = await deleteAgent(id);
    return NextResponse.json({ success: result });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete agent' }, { status: 500 });
  }
}
