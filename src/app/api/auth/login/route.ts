import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 });
    }

    // Cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Email tidak terdaftar' }, { status: 401 });
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Password salah' }, { status: 401 });
    }

    // Return data user (tanpa password)
    return NextResponse.json({ 
      message: 'Login berhasil', 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        grade: user.grade
      }
    });
  } catch (error: any) {
    console.error('LOGIN ERROR:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
