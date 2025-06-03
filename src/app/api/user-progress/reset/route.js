import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) {
    console.log("Unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { game } = await request.json();

  if (!game) {
    return NextResponse.json(
      { error: "Game parameter is required" },
      { status: 400 }
    );
  }

  try {
    // Find the game by name
    const game_obj = await prisma.game.findUnique({
      where: { name: game },
    });

    if (!game_obj) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Start a transaction to ensure atomicity
    await prisma.$transaction([
      // Delete all scores for the user and game
      prisma.score.deleteMany({
        where: {
          userId,
          gameId: game_obj.id,
        },
      }),
      // Reset or delete user progress for the game
      prisma.userProgress.upsert({
        where: {
          userId_gameId: {
            userId,
            gameId: game_obj.id,
          },
        },
        update: {
          levelsPassed: 0,
        },
        create: {
          userId,
          gameId: game_obj.id,
          levelsPassed: 0,
        },
      }),
    ]);

    return NextResponse.json({
      message: "Progress and scores reset successfully",
    });
  } catch (error) {
    console.error("Error resetting progress:", error);
    return NextResponse.json(
      { error: "Failed to reset progress" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
