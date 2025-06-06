const { PrismaClient } = require('../src/generated/prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Starting seeding process...");

  if (!prisma.game) {
    throw new Error("prisma.game is undefined. Ensure the Game model is defined in schema.prisma and prisma generate has been run.");
  }

  await prisma.game.createMany({
    data: [
      { name: "EnglishGame" },
      { name: "FlagsGame" },
      { name: "MathsGame" },
    ],
    skipDuplicates: true,
  });
  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });