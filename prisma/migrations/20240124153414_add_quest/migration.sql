/*
  Warnings:

  - A unique constraint covering the columns `[signaturePublicKey]` on the table `Location` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "Quest" (
    "id" SERIAL NOT NULL,
    "summonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sponsor" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "buidlReward" INTEGER NOT NULL,
    "userPartialCt" INTEGER NOT NULL,
    "locationPartialCt" INTEGER NOT NULL,

    CONSTRAINT "Quest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_LocationQuestReq" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_LocationQuestPartialReq" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_UserQuestReq" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_UserQuestPartialReq" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Quest_summonId_key" ON "Quest"("summonId");

-- CreateIndex
CREATE UNIQUE INDEX "_LocationQuestReq_AB_unique" ON "_LocationQuestReq"("A", "B");

-- CreateIndex
CREATE INDEX "_LocationQuestReq_B_index" ON "_LocationQuestReq"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_LocationQuestPartialReq_AB_unique" ON "_LocationQuestPartialReq"("A", "B");

-- CreateIndex
CREATE INDEX "_LocationQuestPartialReq_B_index" ON "_LocationQuestPartialReq"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_UserQuestReq_AB_unique" ON "_UserQuestReq"("A", "B");

-- CreateIndex
CREATE INDEX "_UserQuestReq_B_index" ON "_UserQuestReq"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_UserQuestPartialReq_AB_unique" ON "_UserQuestPartialReq"("A", "B");

-- CreateIndex
CREATE INDEX "_UserQuestPartialReq_B_index" ON "_UserQuestPartialReq"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Location_signaturePublicKey_key" ON "Location"("signaturePublicKey");

-- AddForeignKey
ALTER TABLE "_LocationQuestReq" ADD CONSTRAINT "_LocationQuestReq_A_fkey" FOREIGN KEY ("A") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LocationQuestReq" ADD CONSTRAINT "_LocationQuestReq_B_fkey" FOREIGN KEY ("B") REFERENCES "Quest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LocationQuestPartialReq" ADD CONSTRAINT "_LocationQuestPartialReq_A_fkey" FOREIGN KEY ("A") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LocationQuestPartialReq" ADD CONSTRAINT "_LocationQuestPartialReq_B_fkey" FOREIGN KEY ("B") REFERENCES "Quest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserQuestReq" ADD CONSTRAINT "_UserQuestReq_A_fkey" FOREIGN KEY ("A") REFERENCES "Quest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserQuestReq" ADD CONSTRAINT "_UserQuestReq_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserQuestPartialReq" ADD CONSTRAINT "_UserQuestPartialReq_A_fkey" FOREIGN KEY ("A") REFERENCES "Quest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserQuestPartialReq" ADD CONSTRAINT "_UserQuestPartialReq_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
