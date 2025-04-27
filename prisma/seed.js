const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.word.createMany({
    data: [
      {
        answer: "CAT",
        image: "/images/cat.png",
        options: ["A", "B", "C", "D", "E", "F", "G", "T"],
        level: 1,
      },
      {
        answer: "DOG",
        image: "/images/dog.png",
        options: ["D", "E", "F", "G", "H", "I", "J", "O"],
        level: 1,
      },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
