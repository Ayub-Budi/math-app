export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const passcode = searchParams.get('passcode');

    // Menggunakan env atau fallback password untuk keamanan
    const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "mathquestAdmin2026";
    
    if (passcode !== ADMIN_PASSCODE) {
      return NextResponse.json({ error: 'Akses Ditolak: Kata sandi salah.' }, { status: 401 });
    }

    // Mengambil data pengguna tanpa mengikutsertakan password
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        grade: true,
        totalXp: true,
        gamePoints: true,
        level: true,
        createdAt: true,
        lastActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      }
    });

    const totalUsers = users.length;
    const sdCount = users.filter(u => u.grade === 'SD').length;
    const smpCount = users.filter(u => u.grade === 'SMP').length;
    const smaCount = users.filter(u => u.grade === 'SMA').length;
    
    // Menghitung total XP di seluruh ekosistem
    const totalXpAll = users.reduce((acc, u) => acc + u.totalXp, 0);
    // Menghitung total Poin Game yang beredar
    const totalPointsAll = users.reduce((acc, u) => acc + u.gamePoints, 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        gradeDistribution: { SD: sdCount, SMP: smpCount, SMA: smaCount },
        totalXpAll,
        totalPointsAll
      },
      users
    });
  } catch (error) {
    console.error("Admin API Error:", error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
