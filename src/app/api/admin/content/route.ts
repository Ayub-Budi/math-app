import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { curriculum } from '@/lib/topics';
import { generateQuestions, generateTheory } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const passcode = searchParams.get('passcode');
    const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "mathquestAdmin2026";
    
    if (passcode !== ADMIN_PASSCODE) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ambil semua status dari DB
    const [allTheory, allBank] = await Promise.all([
      prisma.theory.findMany({
        select: { category: true, topicId: true, grade: true, updatedAt: true }
      }),
      prisma.aIBankSoal.findMany({
        select: { category: true, topicId: true, grade: true, updatedAt: true }
      })
    ]);

    // Format data untuk dashboard
    const contentStatus = curriculum.map(cat => ({
      id: cat.id,
      title: cat.title,
      topics: cat.topics.map(topic => {
        const grades = ['SD', 'SMP', 'SMA'].map(grade => {
          const hasTheory = allTheory.find(t => t.category === cat.id && t.topicId === topic.id && t.grade === grade);
          const hasQuestions = allBank.find(b => b.category === cat.id && b.topicId === topic.id && b.grade === grade);
          
          return {
            grade,
            theoryStatus: !!hasTheory,
            questionsStatus: !!hasQuestions,
            updatedAt: hasTheory?.updatedAt || hasQuestions?.updatedAt || null
          };
        });
        
        return {
          id: topic.id,
          title: topic.title,
          statusByGrade: grades
        };
      })
    }));

    return NextResponse.json({ success: true, contentStatus });
  } catch (error) {
    console.error("Admin Content API Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { passcode, category, topicId, grade, type } = await req.json();
    const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "mathquestAdmin2026";
    
    if (passcode !== ADMIN_PASSCODE) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (type === 'theory') {
      const content = await generateTheory(category, topicId, grade);
      await prisma.theory.upsert({
        where: { category_topicId_grade: { category, topicId, grade } },
        update: { content, updatedAt: new Date() },
        create: { category, topicId, grade, content }
      });
    } else if (type === 'questions') {
      const questions = await generateQuestions(category, topicId, grade);
      await prisma.aIBankSoal.upsert({
        where: { category_topicId_grade: { category, topicId, grade } },
        update: { questions, updatedAt: new Date() },
        create: { category, topicId, grade, questions }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Content Generation Error:", error);
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
  }
}
