/*
  Warnings:

  - A unique constraint covering the columns `[gameId,answer]` on the table `Word` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Word" ADD COLUMN     "gameId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Word_gameId_answer_key" ON "Word"("gameId", "answer");

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;
