const { PrismaClient } = require("../src/generated/prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    // Fetch the EnglishGame
    const game = await prisma.game.findUnique({
      where: { name: "EnglishGame" },
    });

    if (!game) {
      throw new Error("EnglishGame not found. Please seed the game first.");
    }

    // Update all words to set gameId
    const updateResult = await prisma.word.updateMany({
      where: {
        gameId: null, // Only update words without a gameId
      },
      data: {
        gameId: game.id,
      },
    });

    console.log(`Updated ${updateResult.count} words with gameId ${game.id}.`);
  } catch (error) {
    console.error("Error updating words:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();