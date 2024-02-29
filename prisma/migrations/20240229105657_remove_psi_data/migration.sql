/*
  Warnings:

  - You are about to drop the column `wantsExperimentalFeatures` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `PsiMessage` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "wantsExperimentalFeatures",
ALTER COLUMN "psiRound1Message" DROP NOT NULL,
ALTER COLUMN "psiRound1Message" SET DEFAULT '';

-- DropTable
DROP TABLE "PsiMessage";
