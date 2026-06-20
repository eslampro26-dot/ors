
import { NextResponse } from 'next/server';
import { getSettings, saveSettings, getSocialMedia, saveSocialMedia } from '@/lib/db';
import { verifyApiSecret } from '@/lib/auth';

export async function GET() {
  try {
    const [settings, social] = await Promise.all([getSettings(), getSocialMedia()]);
    return NextResponse.json({ ...settings, ...social });
  } catch (e) {
    console.error('API Error fetching settings:', e);
    return NextResponse.json({}, { status: 500 });
  }
}

export async function POST(request) {
  if (!verifyApiSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();

    if (body.type === 'social') {
      const result = await saveSocialMedia(body.data);
      return NextResponse.json({ success: result });
    }

    const result = await saveSettings(body);
    return NextResponse.json({ success: result });
  } catch (e) {
    console.error('API Error saving settings:', e);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
