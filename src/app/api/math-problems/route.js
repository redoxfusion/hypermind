import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const level = parseInt(searchParams.get('level'));
  const gameName = searchParams.get('game');

  if (!level || !gameName) {
    return NextResponse.json({ error: 'Level and game are required' }, { status: 400 });
  }

  try {
    const game = await prisma.game.findUnique({
      where: { name: gameName },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const problems = await prisma.mathProblem.findMany({
      where: {
        gameId: game.id,
        level: level,
      },
    });

    return NextResponse.json(problems);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch math problems' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}