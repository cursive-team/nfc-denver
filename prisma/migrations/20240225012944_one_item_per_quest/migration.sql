/*
  Warnings:

  - You are about to drop the column `questRequirementIds` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the `QrCode` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ItemQuestRequirements` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[questId]` on the table `Item` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[itemId]` on the table `Quest` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "QrCode" DROP CONSTRAINT "QrCode_itemId_fkey";

-- DropForeignKey
ALTER TABLE "QrCode" DROP CONSTRAINT "QrCode_userId_fkey";

-- DropForeignKey
ALTER TABLE "_ItemQuestRequirements" DROP CONSTRAINT "_ItemQuestRequirements_A_fkey";

-- DropForeignKey
ALTER TABLE "_ItemQuestRequirements" DROP CONSTRAINT "_ItemQuestRequirements_B_fkey";

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "questRequirementIds",
ADD COLUMN     "isSoldOut" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "questId" INTEGER;

-- AlterTable
ALTER TABLE "Quest" ADD COLUMN     "itemId" INTEGER;

-- AlterTable
ALTER TABLE "QuestProof" ADD COLUMN     "redeemed" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "QrCode";

-- DropTable
DROP TABLE "_ItemQuestRequirements";

-- CreateTable
CREATE TABLE "UserSigNullifier" (
    "id" TEXT NOT NULL,
    "questProofId" TEXT NOT NULL,
    "userRequirementId" INTEGER NOT NULL,
    "sigNullifier" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSigNullifier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocationSigNullifier" (
    "id" TEXT NOT NULL,
    "questProofId" TEXT NOT NULL,
    "locationRequirementId" INTEGER NOT NULL,
    "sigNullifier" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LocationSigNullifier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Item_questId_key" ON "Item"("questId");

-- CreateIndex
CREATE UNIQUE INDEX "Quest_itemId_key" ON "Quest"("itemId");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSigNullifier" ADD CONSTRAINT "UserSigNullifier_questProofId_fkey" FOREIGN KEY ("questProofId") REFERENCES "QuestProof"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSigNullifier" ADD CONSTRAINT "UserSigNullifier_userRequirementId_fkey" FOREIGN KEY ("userRequirementId") REFERENCES "UserRequirement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationSigNullifier" ADD CONSTRAINT "LocationSigNullifier_questProofId_fkey" FOREIGN KEY ("questProofId") REFERENCES "QuestProof"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationSigNullifier" ADD CONSTRAINT "LocationSigNullifier_locationRequirementId_fkey" FOREIGN KEY ("locationRequirementId") REFERENCES "LocationRequirement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
