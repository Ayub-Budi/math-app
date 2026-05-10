import { NextResponse } from 'next/server';
import { generateTheory } from '@/lib/gemini';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || 'Aritmatika';
  const topicId = searchParams.get('topic') || 'general';
  const grade = searchParams.get('grade') || 'SD';

  try {
    // 1. Cek di Database dulu
    const existingTheory = await prisma.theory.findUnique({
      where: {
        category_topicId_grade: { category, topicId, grade }
      }
    });

    // 2. Jika ada dan umurnya kurang dari 30 hari, gunakan yang ada
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    if (existingTheory && existingTheory.updatedAt > oneMonthAgo) {
      console.log(`[CACHE HIT] Mengambil materi ${category}/${topicId} (${grade}) dari DB`);
      return NextResponse.json({ theory: existingTheory.content });
    }

    // 3. Jika tidak ada atau sudah basi (> 1 bulan), generate baru via Gemini
    console.log(`[CACHE MISS] Menghasilkan materi ${category}/${topicId} (${grade}) via Gemini`);
    const newContent = await generateTheory(category, topicId, grade);

    if (newContent === "Materi belum tersedia saat ini.") {
       // Jika Gemini gagal, coba tetap pakai yang lama jika ada
       if (existingTheory) return NextResponse.json({ theory: existingTheory.content });
       
       // Jika benar-benar baru dan Gemini gagal (misal kena Limit Kuota), berikan materi standar terstruktur
       const fallbackTheory = {
         title: `Belajar Konsep: ${category.toUpperCase()}`,
         introduction: `Selamat datang di materi ${category}! Saat ini sistem kecerdasan buatan kami sedang beristirahat sejenak karena terlalu banyak permintaan (Limit Kuota).`,
         sections: [
           {
             heading: "Sedang Dalam Proses",
             content: "Materi lengkap yang mendalam akan segera tersedia. Kamu bisa mencoba muat ulang halaman ini dalam 1-2 menit."
           }
         ],
         example: {
           question: "Berapa banyak kesabaran yang dibutuhkan untuk menjadi ahli matematika?",
           solution: "Kesabaran tak terhingga! Teruslah berlatih sambil menunggu AI kami siap kembali."
         }
       };
       
       return NextResponse.json({ theory: fallbackTheory });
    }

    // 4. Simpan/Update ke Database
    await prisma.theory.upsert({
      where: {
        category_topicId_grade: { category, topicId, grade }
      },
      update: {
        content: newContent,
        updatedAt: new Date()
      },
      create: {
        category,
        topicId,
        grade,
        content: newContent
      }
    });

    return NextResponse.json({ theory: newContent });
  } catch (error: any) {
    console.error("THEORY API ERROR:", error);
    return NextResponse.json({ error: 'Failed to manage theory' }, { status: 500 });
  }
}
