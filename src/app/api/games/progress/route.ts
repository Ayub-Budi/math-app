import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, gameId, level } = body;

    if (!userId || !gameId || typeof level !== 'number') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Upsert game progress
    const progress = await prisma.gameProgress.upsert({
      where: {
        userId_gameId: { userId, gameId }
      },
      update: {
        level: level,
        isMaxed: level >= 10
      },
      create: {
        userId,
        gameId,
        level: level,
        isMaxed: level >= 10
      }
    });

    let newTitle = null;

    // Check for title award if maxed (Level 10)
    if (progress.isMaxed) {
      const titlesMap: Record<string, string> = {
        'assessment': 'Sang Arsitek Bentuk',
        'equation-game': 'Master Aljabar',
        'sort-game': 'Si Kilat Pengurut',
        'invaders': 'Penembak Jitu Angka',
        'fraction-bridge': 'Insinyur Pecahan',
        'pattern-breaker': 'Hacker Pola',
        'grid-navigator': 'Navigator Handal'
      };

      const titleToAward = titlesMap[gameId];
      
      if (titleToAward) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user) {
          let currentTitles: string[] = [];
          if (user.titles) {
            try {
              currentTitles = JSON.parse(user.titles);
            } catch (e) {
              currentTitles = [];
            }
          }
          
          if (!currentTitles.includes(titleToAward)) {
            currentTitles.push(titleToAward);
            await prisma.user.update({
              where: { id: userId },
              data: { titles: JSON.stringify(currentTitles) }
            });
            newTitle = titleToAward;
          }
        }
      }
    }

    return NextResponse.json({ progress, newTitle });
  } catch (error: any) {
    console.error('Progress Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const gameId = searchParams.get('gameId');

  if (!userId) {
    return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
  }

  try {
    if (gameId) {
      const progress = await prisma.gameProgress.findUnique({
        where: { userId_gameId: { userId, gameId } }
      });
      return NextResponse.json({ progress });
    } else {
      const allProgress = await prisma.gameProgress.findMany({
        where: { userId }
      });
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const titles = user?.titles ? JSON.parse(user.titles) : [];
      
      return NextResponse.json({ progress: allProgress, titles });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
