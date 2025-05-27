import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth, createClerkClient } from "@clerk/nextjs/server";

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
    console.log("Unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const game = searchParams.get('game');
  const allUsers = searchParams.get('allUsers') === 'true';

  try {
    let scores;
    if (!game && allUsers) {
      // Fetch scores for all users across all games
      scores = await prisma.score.findMany({
        include: { game: true },
        orderBy: { level: "asc" },
      });
    } else if (!game) {
      return NextResponse.json({ error: "Game parameter is required" }, { status: 400 });
    } else {
      const game_obj = await prisma.game.findUnique({
        where: { name: game },
      });

      if (!game_obj) {
        return NextResponse.json({ error: "Game not found" }, { status: 404 });
      }

      const whereClause = allUsers
        ? { gameId: game_obj.id }
        : { userId, gameId: game_obj.id };

      scores = await prisma.score.findMany({
        where: whereClause,
        include: { game: true },
        orderBy: { level: "asc" },
      });
    }

    // Initialize Clerk client
    const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

    // Fetch user metadata from Clerk for all unique userIds in scores
    const userIds = [...new Set(scores.map((score) => score.userId))];
    const { data: clerkUsers } = await clerkClient.users.getUserList({ userId: userIds });
    const userMap = clerkUsers.reduce((acc, user) => {
      acc[user.id] = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress || '',
      };
      return acc;
    }, {});

    // Attach user metadata to scores
    const enrichedScores = scores.map((score) => ({
      ...score,
      user: {
        firstName: userMap[score.userId]?.firstName || '',
        lastName: userMap[score.userId]?.lastName || '',
        email: userMap[score.userId]?.email || '',
      },
    }));

    return NextResponse.json(enrichedScores);
  } catch (error) {
    console.error("Error fetching scores:", error);
    return NextResponse.json(
      { error: "Failed to fetch scores" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}