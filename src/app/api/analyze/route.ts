import { NextResponse } from 'next/server';
import { getStudyTips } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const tips = await getStudyTips(body);
    return NextResponse.json({ tips });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to analyze data' }, { status: 500 });
  }
}
