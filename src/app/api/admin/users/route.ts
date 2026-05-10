import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { passcode, userId, name, email, grade, level, totalXp, gamePoints } = body;
    
    const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "mathquestAdmin2026";
    
    if (passcode !== ADMIN_PASSCODE) {
      return NextResponse.json({ error: 'Passcode Admin Salah!' }, { status: 401 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        grade,
        level: Number(level),
        totalXp: Number(totalXp),
        gamePoints: Number(gamePoints)
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("Admin User Update Error:", error);
    return NextResponse.json({ error: `Gagal Update: ${error.message}` }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const passcode = searchParams.get('passcode');
    const userId = searchParams.get('userId');
    
    const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "mathquestAdmin2026";
    
    if (passcode !== ADMIN_PASSCODE) {
      return NextResponse.json({ error: 'Passcode Admin Salah!' }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'ID User diperlukan!' }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.userProgress.deleteMany({ where: { userId } }),
      prisma.gameProgress.deleteMany({ where: { userId } }),
      prisma.learningProgress.deleteMany({ where: { userId } }),
      prisma.analytics.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } })
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin User Delete Error:", error);
    return NextResponse.json({ error: `Gagal Hapus: ${error.message}` }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
