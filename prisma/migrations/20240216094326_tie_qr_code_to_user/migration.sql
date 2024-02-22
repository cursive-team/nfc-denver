/*
  Warnings:

  - You are about to drop the column `questProofIds` on the `QrCode` table. All the data in the column will be lost.
  - You are about to drop the `_QuestProofQrCodes` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[itemId,userId]` on the table `QrCode` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `QrCode` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_QuestProofQrCodes" DROP CONSTRAINT "_QuestProofQrCodes_A_fkey";

-- DropForeignKey
ALTER TABLE "_QuestProofQrCodes" DROP CONSTRAINT "_QuestProofQrCodes_B_fkey";

-- AlterTable
ALTER TABLE "QrCode" DROP COLUMN "questProofIds",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_QuestProofQrCodes";

-- CreateIndex
CREATE UNIQUE INDEX "QrCode_itemId_userId_key" ON "QrCode"("itemId", "userId");

-- AddForeignKey
ALTER TABLE "QrCode" ADD CONSTRAINT "QrCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
