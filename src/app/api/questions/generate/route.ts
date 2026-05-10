import { NextResponse } from 'next/server';
import { generateQuestions } from '@/lib/gemini';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || 'Aritmatika';
  const topicId = searchParams.get('topic') || 'general';
  const grade = searchParams.get('grade') || 'SD';

  try {
    // 1. Cek di Bank Soal (Database)
    const existingBank = await prisma.aIBankSoal.findUnique({
      where: {
        category_topicId_grade: { category, topicId, grade }
      }
    });

    // 2. Jika ada dan umurnya kurang dari 30 hari, gunakan yang ada
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    if (existingBank && existingBank.updatedAt > oneMonthAgo) {
      console.log(`[BANK SOAL HIT] Mengambil soal ${category}/${topicId} (${grade}) dari DB`);
      return NextResponse.json(existingBank.questions);
    }

    // 3. Jika tidak ada atau sudah basi, generate baru via Gemini
    console.log(`[BANK SOAL MISS] Menghasilkan soal ${category}/${topicId} (${grade}) via Gemini`);
    const questions = await generateQuestions(category, topicId, grade);

    // 4. Simpan ke Bank Soal
    if (Array.isArray(questions) && questions.length > 0) {
      await prisma.aIBankSoal.upsert({
        where: {
          category_topicId_grade: { category, topicId, grade }
        },
        update: {
          questions: questions,
          updatedAt: new Date()
        },
        create: {
          category,
          topicId,
          grade,
          questions: questions
        }
      });
    }

    return NextResponse.json(questions);
  } catch (error) {
    console.error("BANK SOAL API ERROR:", error);
    return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
  }
}
