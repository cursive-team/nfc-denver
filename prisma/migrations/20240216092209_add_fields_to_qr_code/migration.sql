/*
  Warnings:

  - Added the required column `itemId` to the `QrCode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "QrCode" ADD COLUMN     "itemId" INTEGER NOT NULL,
ADD COLUMN     "redeemed" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "QrCode" ADD CONSTRAINT "QrCode_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
