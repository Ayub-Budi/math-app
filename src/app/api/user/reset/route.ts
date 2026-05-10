import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
    }

    // 1. Reset User stats
    await prisma.user.update({
      where: { id: userId },
      data: {
        totalXp: 0,
        level: 1,
        health: 5,
        streak: 0,
        titles: null
      }
    });

    // 2. Clear Learning Progress
    await prisma.learningProgress.deleteMany({
      where: { userId }
    });

    // 3. Clear Game Progress
    await prisma.gameProgress.deleteMany({
      where: { userId }
    });

    // 4. Clear User Progress (Topic Unlocks)
    await prisma.userProgress.deleteMany({
      where: { userId }
    });

    return NextResponse.json({ message: 'Data berhasil direset' });
  } catch (error: any) {
    console.error('Reset Data Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
