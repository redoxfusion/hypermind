-- CreateTable
CREATE TABLE "MathProblem" (
    "id" SERIAL NOT NULL,
    "problem" TEXT NOT NULL,
    "answer" INTEGER NOT NULL,
    "options" JSON NOT NULL,
    "level" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,

    CONSTRAINT "MathProblem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MathProblem_problem_key" ON "MathProblem"("problem");

-- AddForeignKey
ALTER TABLE "MathProblem" ADD CONSTRAINT "MathProblem_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
