const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Delete all records from the Word table
  const deletedWords = await prisma.word.deleteMany();
  console.log(`Deleted ${deletedWords.count} words from the database.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });