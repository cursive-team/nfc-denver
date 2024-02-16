/*
  Warnings:

  - A unique constraint covering the columns `[questId,userId]` on the table `QuestProof` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "QrCode" (
    "id" TEXT NOT NULL,
    "questProofIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QrCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_QuestProofQrCodes" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_QuestProofQrCodes_AB_unique" ON "_QuestProofQrCodes"("A", "B");

-- CreateIndex
CREATE INDEX "_QuestProofQrCodes_B_index" ON "_QuestProofQrCodes"("B");

-- CreateIndex
CREATE UNIQUE INDEX "QuestProof_questId_userId_key" ON "QuestProof"("questId", "userId");

-- AddForeignKey
ALTER TABLE "_QuestProofQrCodes" ADD CONSTRAINT "_QuestProofQrCodes_A_fkey" FOREIGN KEY ("A") REFERENCES "QrCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuestProofQrCodes" ADD CONSTRAINT "_QuestProofQrCodes_B_fkey" FOREIGN KEY ("B") REFERENCES "QuestProof"("id") ON DELETE CASCADE ON UPDATE CASCADE;
