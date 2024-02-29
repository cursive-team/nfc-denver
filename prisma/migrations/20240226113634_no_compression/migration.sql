/*
  Warnings:

  - You are about to drop the column `compressedData` on the `PsiMessage` table. All the data in the column will be lost.
  - Added the required column `data` to the `PsiMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PsiMessage" DROP COLUMN "compressedData",
ADD COLUMN     "data" TEXT NOT NULL;
