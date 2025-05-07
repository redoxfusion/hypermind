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

// Function to safely evaluate a math expression
function evaluateExpression(expr) {
  try {
    const sanitized = expr
      .replace('×', '*')
      .replace('÷', '/')
      .replace(/(\d+)\s*([\+\-\×\÷])\s*(\d+)/g, (_, a, op, b) => {
        a = parseInt(a);
        b = parseInt(b);
        if (op === '+') return (a + b).toString();
        if (op === '-') return (a - b).toString();
        if (op === '*') return (a * b).toString();
        if (op === '/' && b !== 0) return (Math.floor(a / b)).toString();
        return '0'; // Default to 0 if division by zero
      });
    return eval(sanitized);
  } catch (e) {
    console.error(`Evaluation error for ${expr}: ${e}`);
    return 0;
  }
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
      // Levels 21-30: Mixed operations with larger numbers
      const a = Math.floor(Math.random() * 50) + 1;
      const b = Math.floor(Math.random() * 50) + 1;
      const c = Math.floor(Math.random() * 20) + 1;
      const operations = ['+', '-', '×', '÷'];
      const op1 = operations[Math.floor(Math.random() * 3)]; // Avoid division initially
      let op2 = operations[Math.floor(Math.random() * 3)];
      let expr = `(${a} ${op1} ${b}) ${op2} ${c}`;
      answer = evaluateExpression(expr);
      // Ensure answer is an integer and adjust if division is involved
      if (op2 === '÷' && c === 0) {
        op2 = '+';
        expr = `(${a} ${op1} ${b}) + ${c}`;
        answer = evaluateExpression(expr);
      }
      problem = expr;
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