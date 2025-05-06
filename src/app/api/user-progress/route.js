import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const progress = await prisma.userProgress.findFirst({
      where: { userId, game: { name: "EnglishGame" } },
      include: { game: true },
    });

    return NextResponse.json({
      levelsPassed: progress ? progress.levelsPassed : 0,
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
  }
}

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { levelsPassed } = await request.json();

  try {
    const game = await prisma.game.findUnique({
      where: { name: "EnglishGame" },
    });

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const progress = await prisma.userProgress.upsert({
      where: {
        userId_gameId: { userId, gameId: game.id }, // Composite unique key
      },
      update: { levelsPassed },
      create: {
        userId,
        gameId: game.id,
        levelsPassed,
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Error updating progress:", error);
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
  }
}