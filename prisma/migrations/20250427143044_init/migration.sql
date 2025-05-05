-- CreateTable
CREATE TABLE "Word" (
    "id" SERIAL NOT NULL,
    "answer" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "options" TEXT[],
    "level" INTEGER NOT NULL,

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);
