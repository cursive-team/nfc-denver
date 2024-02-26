/*
  Warnings:

  - You are about to drop the column `recipientId` on the `PsiMessage` table. All the data in the column will be lost.
  - You are about to drop the column `senderId` on the `PsiMessage` table. All the data in the column will be lost.
  - You are about to drop the column `sent` on the `PsiMessage` table. All the data in the column will be lost.
  - Added the required column `recipientEncKey` to the `PsiMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderEncKey` to the `PsiMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PsiMessage" DROP COLUMN "recipientId",
DROP COLUMN "senderId",
DROP COLUMN "sent",
ADD COLUMN     "recipientEncKey" TEXT NOT NULL,
ADD COLUMN     "senderEncKey" TEXT NOT NULL;
