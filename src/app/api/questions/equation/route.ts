import { NextResponse } from 'next/server';
import { generateEquationLevels } from '@/lib/gemini';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const grade = searchParams.get('grade') || 'SD';

  try {
    const levels = await generateEquationLevels(grade);
    return NextResponse.json(levels);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate levels' }, { status: 500 });
  }
}
