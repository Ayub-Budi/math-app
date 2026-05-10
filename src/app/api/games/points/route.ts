import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, gameId, points } = body;

    if (!userId || points === undefined) {
      return NextResponse.json({ error: 'UserId and points are required' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        gamePoints: { increment: points }
      }
    });

    return NextResponse.json({ 
      message: 'Poin berhasil ditambahkan', 
      gamePoints: updatedUser.gamePoints 
    });
  } catch (error: any) {
    console.error('GAME POINTS ERROR:', error);
    return NextResponse.json({ error: 'Gagal menambahkan poin' }, { status: 500 });
  }
}
