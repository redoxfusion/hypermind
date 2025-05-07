import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { level, score, game } = await request.json();

  try {
    const game_obj = await prisma.game.findUnique({
      where: { name: game },
    });

    if (!game_obj) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const newScore = await prisma.score.create({
      data: {
        userId,
        gameId: game_obj.id,
        level,
        score,
      },
    });

    return NextResponse.json(newScore);
  } catch (error) {
    console.error("Error saving score:", error);
    return NextResponse.json(
      { error: "Failed to save score" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get game from query parameters
  const { searchParams } = new URL(request.url);
  const game = searchParams.get('game');

  if (!game) {
    return NextResponse.json({ error: "Game parameter is required" }, { status: 400 });
  }

  try {
    const game_obj = await prisma.game.findUnique({
      where: { name: game },
    });

    if (!game_obj) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const scores = await prisma.score.findMany({
      where: { userId, gameId: game_obj.id },
      orderBy: { level: "asc" },
    });

    return NextResponse.json(scores);
  } catch (error) {
    console.error("Error fetching scores:", error);
    return NextResponse.json(
      { error: "Failed to fetch scores" },
      { status: 500 }
    );
  }
}
