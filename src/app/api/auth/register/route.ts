import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  try {
    const { name, email, password, grade } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user baru
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        grade: grade || "SD",
        totalXp: 0,
        level: 1,
        streak: 0,
      },
    });

    return NextResponse.json({ 
      message: 'User berhasil didaftarkan', 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        grade: user.grade
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('FULL REGISTRATION ERROR:', error);
    return NextResponse.json({ error: 'Kesalahan Database: ' + error.message }, { status: 500 });
  }
}
