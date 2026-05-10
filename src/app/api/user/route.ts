import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
  }

  try {
    let user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Daily Health Reset Logic
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastReset = user.lastHealthReset ? new Date(user.lastHealthReset) : null;
    lastReset?.setHours(0, 0, 0, 0);

    if (!lastReset || lastReset.getTime() < today.getTime()) {
      user = await prisma.user.update({
        where: { id: userId },
        data: {
          health: 5,
          lastHealthReset: new Date(),
        }
      });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      grade: user.grade,
      totalXp: user.totalXp,
      gamePoints: user.gamePoints,
      level: user.level,
      streak: user.streak,
      health: user.health,
      titles: user.titles,
      image: user.image,
      createdAt: user.createdAt
    });
  } catch (error: any) {
    console.error('USER FETCH ERROR:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { userId, name, grade, image, health, exchangePointsForHealth } = body;

    if (!userId) {
      return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
    }

    // Handle heart exchange
    if (exchangePointsForHealth) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      
      const cost = 100; // 100 points per heart
      if (user.gamePoints < cost) {
        return NextResponse.json({ error: 'Poin tidak cukup! Butuh 100 poin.' }, { status: 400 });
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          gamePoints: { decrement: cost },
          health: { increment: 1 }
        }
      });

      return NextResponse.json({ 
        message: 'Nyawa berhasil ditukar!', 
        gamePoints: updatedUser.gamePoints,
        health: updatedUser.health
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || undefined,
        grade: grade || undefined,
        image: image || undefined,
        health: health !== undefined ? health : undefined,
      }
    });

    return NextResponse.json({ 
      message: 'Profil berhasil diperbarui', 
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        grade: updatedUser.grade,
        image: updatedUser.image,
        health: updatedUser.health,
        gamePoints: updatedUser.gamePoints
      }
    });
  } catch (error: any) {
    console.error('USER UPDATE ERROR:', error);
    return NextResponse.json({ error: 'Gagal memperbarui profil' }, { status: 500 });
  }
}
