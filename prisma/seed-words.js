const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.word.createMany({
    data: [
      { answer: "DOG", image: "/images/english/Theme-3D-2.png", options: ["D", "E", "F", "G", "H", "I", "J", "O"], level: 1 },
      { answer: "WOLF", image: "/images/english/Theme-3D-3.png", options: ["F", "H", "I", "J", "L", "O", "W", "X"], level: 2 },
      { answer: "FOX", image: "/images/english/Theme-3D-4.png", options: ["E", "F", "H", "I", "J", "O", "W", "X"], level: 3 },
      { answer: "RACCOON", image: "/images/english/Theme-3D-5.png", options: ["A", "C", "E", "N", "O", "R", "S", "T"], level: 4 },
      { answer: "CAT", image: "/images/english/Theme-3D-6.png", options: ["A", "B", "C", "D", "E", "F", "G", "T"], level: 5 },
      { answer: "LION", image: "/images/english/Theme-3D-7.png", options: ["E", "H", "I", "L", "N", "O", "S", "T"], level: 6 },
      { answer: "TIGER", image: "/images/english/Theme-3D-8.png", options: ["E", "G", "H", "I", "R", "S", "T", "U"], level: 7 },
      { answer: "LEOPARD", image: "/images/english/Theme-3D-9.png", options: ["A", "D", "E", "L", "O", "P", "R", "S"], level: 8 },
      { answer: "HORSE", image: "/images/english/Theme-3D-10.png", options: ["E", "H", "I", "O", "R", "S", "T", "U"], level: 9 },
      { answer: "UNICORN", image: "/images/english/Theme-3D-11.png", options: ["C", "I", "N", "O", "R", "S", "U", "Y"], level: 10 },
      { answer: "ZEBRA", image: "/images/english/Theme-3D-12.png", options: ["A", "B", "E", "H", "R", "S", "Z", "Y"], level: 11 },
      { answer: "DEER", image: "/images/english/Theme-3D-13.png", options: ["A", "D", "E", "F", "H", "R", "S", "T"], level: 12 },
      { answer: "BISON", image: "/images/english/Theme-3D-14.png", options: ["B", "E", "I", "N", "O", "S", "T", "U"], level: 13 },
      { answer: "COW", image: "/images/english/Theme-3D-15.png", options: ["A", "C", "D", "E", "H", "O", "W", "Y"], level: 14 },
      { answer: "BULL", image: "/images/english/Theme-3D-16.png", options: ["B", "E", "H", "I", "L", "S", "U", "Y"], level: 15 },
      { answer: "OX", image: "/images/english/Theme-3D-17.png", options: ["A", "B", "E", "H", "O", "S", "T", "X"], level: 16 },
      { answer: "CALF", image: "/images/english/Theme-3D-18.png", options: ["A", "C", "E", "F", "H", "L", "S", "T"], level: 17 },
      { answer: "PIG", image: "/images/english/Theme-3D-19.png", options: ["A", "B", "E", "G", "H", "I", "P", "S"], level: 18 },
      { answer: "SHEEP", image: "/images/english/Theme-3D-20.png", options: ["E", "H", "I", "P", "R", "S", "T", "U"], level: 19 },
      { answer: "LAMB", image: "/images/english/Theme-3D-21.png", options: ["A", "B", "E", "H", "L", "M", "S", "T"], level: 20 },
      { answer: "GOAT", image: "/images/english/Theme-3D-22.png", options: ["A", "B", "G", "H", "O", "S", "T", "Y"], level: 21 },
      { answer: "CAMEL", image: "/images/english/Theme-3D-23.png", options: ["A", "C", "E", "H", "L", "M", "S", "T"], level: 22 },
      { answer: "LLAMA", image: "/images/english/Theme-3D-24.png", options: ["A", "B", "E", "H", "L", "M", "S", "T"], level: 23 },
      { answer: "GIRAFFE", image: "/images/english/Theme-3D-25.png", options: ["A", "E", "F", "G", "I", "R", "S", "T"], level: 24 },
      { answer: "ELEPHANT", image: "/images/english/Theme-3D-26.png", options: ["A", "E", "H", "L", "N", "P", "S", "T"], level: 25 },
      { answer: "RHINO", image: "/images/english/Theme-3D-27.png", options: ["H", "I", "N", "O", "R", "S", "T", "U"], level: 26 },
      { answer: "HIPPO", image: "/images/english/Theme-3D-28.png", options: ["H", "I", "O", "P", "R", "S", "T", "U"], level: 27 },
      { answer: "MOUSE", image: "/images/english/Theme-3D-29.png", options: ["E", "H", "M", "O", "S", "T", "U", "Y"], level: 28 },
      { answer: "RAT", image: "/images/english/Theme-3D-30.png", options: ["A", "B", "E", "H", "R", "S", "T", "Y"], level: 29 },
      { answer: "RABBIT", image: "/images/english/Theme-3D-31.png", options: ["A", "B", "E", "I", "R", "S", "T", "U"], level: 30 },
      { answer: "BUNNY", image: "/images/english/Theme-3D-32.png", options: ["B", "E", "N", "U", "Y", "S", "T", "H"], level: 31 },
      { answer: "SQUIRREL", image: "/images/english/Theme-3D-33.png", options: ["E", "I", "L", "Q", "R", "S", "U", "Y"], level: 32 },
      { answer: "BEAVER", image: "/images/english/Theme-3D-34.png", options: ["A", "B", "E", "R", "S", "T", "V", "Y"], level: 33 },
      { answer: "HEDGEHOG", image: "/images/english/Theme-3D-35.png", options: ["D", "E", "G", "H", "O", "S", "T", "U"], level: 34 },
      { answer: "BEAR", image: "/images/english/Theme-3D-36.png", options: ["A", "B", "E", "H", "R", "S", "T", "Y"], level: 35 },
      { answer: "POLARBEAR", image: "/images/english/Theme-3D-37.png", options: ["A", "B", "E", "L", "O", "P", "R", "S"], level: 36 },
      { answer: "KOALA", image: "/images/english/Theme-3D-38.png", options: ["A", "B", "K", "L", "O", "S", "T", "Y"], level: 37 },
      { answer: "PANDA", image: "/images/english/Theme-3D-39.png", options: ["A", "B", "D", "N", "P", "S", "T", "Y"], level: 38 },
      { answer: "SLOTH", image: "/images/english/Theme-3D-40.png", options: ["H", "L", "O", "S", "T", "U", "V", "Y"], level: 39 },
      { answer: "OTTER", image: "/images/english/Theme-3D-41.png", options: ["E", "O", "R", "S", "T", "U", "V", "Y"], level: 40 },
      { answer: "SKUNK", image: "/images/english/Theme-3D-42.png", options: ["K", "N", "S", "U", "V", "W", "X", "Y"], level: 41 },
      { answer: "KANGAROO", image: "/images/english/Theme-3D-43.png", options: ["A", "G", "K", "N", "O", "R", "S", "U"], level: 42 },
      { answer: "BADGER", image: "/images/english/Theme-3D-44.png", options: ["A", "B", "D", "E", "G", "R", "S", "T"], level: 43 },
      { answer: "PAW", image: "/images/english/Theme-3D-45.png", options: ["A", "B", "E", "P", "S", "T", "W", "Y"], level: 44 },
      { answer: "MOOSE", image: "/images/english/Theme-3D-46.png", options: ["E", "M", "O", "S", "T", "U", "V", "Y"], level: 45 },
      { answer: "MONKEY", image: "/images/english/Theme-3D-47.png", options: ["E", "K", "M", "N", "O", "S", "Y", "Z"], level: 46 },
      { answer: "BAT", image: "/images/english/Theme-3D-48.png", options: ["A", "B", "E", "H", "S", "T", "U", "Y"], level: 47 },
      { answer: "Gorilla", image: "/images/english/Theme-3D-1.png", options: ["G", "Z", "I", "A", "T", "O", "L", "Y"], level: 48 },
    ],
  });

  console.log("Word seed completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });