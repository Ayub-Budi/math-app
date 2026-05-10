import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const categoryId = searchParams.get('categoryId');

  if (!userId) {
    return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
  }

  try {
    if (categoryId) {
      // Get progress for a specific category (all topics in that category)
      const progress = await prisma.learningProgress.findMany({
        where: { userId, categoryId }
      });
      return NextResponse.json(progress);
    } else {
      // Get all learning progress
      const allProgress = await prisma.learningProgress.findMany({
        where: { userId }
      });
      return NextResponse.json(allProgress);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, categoryId, topicId, score, isCompleted } = body;

    if (!userId || !categoryId || !topicId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Upsert learning progress
    const progress = await prisma.learningProgress.upsert({
      where: {
        userId_categoryId_topicId: { userId, categoryId, topicId }
      },
      update: {
        score: Math.max(score, 0), // Use highest score if we want, or just override. Let's override for simplicity, or actually we shouldn't decrease it.
        isCompleted: isCompleted || undefined // If true passed, set it. Otherwise leave it.
      },
      create: {
        userId,
        categoryId,
        topicId,
        score: score || 0,
        isCompleted: isCompleted || false
      }
    });
    
    // Also add XP to user totalXp
    if (score && score > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { totalXp: { increment: score } }
      });
    }

    return NextResponse.json({ progress });
  } catch (error: any) {
    console.error('Learning Progress Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
