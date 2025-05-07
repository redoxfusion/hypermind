const { PrismaClient } = require("../src/generated/prisma/client");
const prisma = new PrismaClient();

// Utility function to shuffle an array (Fisher-Yates shuffle)
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Utility function to generate unique options
function generateOptions(correctAnswer, usedNumbers = []) {
  const options = [correctAnswer];
  const min = Math.max(0, correctAnswer - 10);
  const max = correctAnswer + 10;
  while (options.length < 4) {
    const distractor = Math.floor(Math.random() * (max - min + 1)) + min;
    if (!options.includes(distractor) && !usedNumbers.includes(distractor)) {
      options.push(distractor);
    }
  }
  return shuffle(options);
}

// Function to compute a simple two-term expression
function computeExpression(a, op, b) {
  a = parseInt(a);
  b = parseInt(b);
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  if (op === '×') return a * b;
  if (op === '÷' && b !== 0) return Math.floor(a / b);
  return a; // Default for invalid cases, fallback to a
}

async function main() {
  // Ensure MathsGame exists
  let game = await prisma.game.findUnique({
    where: { name: "MathsGame" },
  });

  if (!game) {
    game = await prisma.game.create({
      data: { name: "MathsGame" },
    });
  }

  // Define math problems for 30 levels
  const mathProblems = [];
  for (let level = 1; level <= 30; level++) {
    let problem, answer;
    const usedNumbers = [];

    if (level <= 10) {
      // Levels 1-10: Simple addition and subtraction
      const a = Math.floor(Math.random() * 10);
      const b = Math.floor(Math.random() * 10);
      problem = level % 2 === 0 ? `${a} + ${b}` : `${Math.max(a, b)} - ${Math.min(a, b)}`;
      answer = level % 2 === 0 ? a + b : Math.max(a, b) - Math.min(a, b);
    } else if (level <= 20) {
      // Levels 11-20: Multiplication and division
      const a = Math.floor(Math.random() * (level <= 15 ? 12 : 20)) + 1;
      let b = Math.floor(Math.random() * (level <= 15 ? 12 : 20)) + 1;
      if (level % 2 !== 0 && a === 0) a = 1; // Avoid division by zero
      problem = level % 2 === 0 ? `${a} × ${b}` : `${a * b} ÷ ${a}`;
      answer = level % 2 === 0 ? a * b : b;
      usedNumbers.push(a * b); // Avoid reusing the product in distractors for division
    } else {
      // Levels 21-30: Two-term mixed operations with larger numbers
      const a = Math.floor(Math.random() * 100) + 1; // Increased range for harder problems
      const b = Math.floor(Math.random() * 50) + 1;
      const operations = ['+', '-', '×', '÷'];
      const op = operations[Math.floor(Math.random() * 4)];
      problem = `${a} ${op} ${b}`;
      answer = computeExpression(a, op, b);
      if (op === '÷' && b === 0) {
        b = 1; // Adjust to avoid division by zero
        problem = `${a} ${op} ${b}`;
        answer = computeExpression(a, op, b);
      }
    }

    const options = generateOptions(answer, usedNumbers);
    mathProblems.push({
      problem,
      answer,
      options,
      level,
      gameId: game.id,
    });
  }

  // Seed the math problems
  await prisma.mathProblem.createMany({
    data: mathProblems,
    skipDuplicates: true,
  });

  console.log("Math problems seed completed successfully.");
}

main()
  .catch((e) => {
    console.error("Error seeding math problems:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });