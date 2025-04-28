const { PrismaClient } = require('@prisma/client');

console.log('Attempting to initialize Prisma Client...');
const prisma = new PrismaClient();
console.log('Prisma Client initialized successfully!');

async function test() {
  try {
    const words = await prisma.word.findMany();
    console.log('Words in database:', words);
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();