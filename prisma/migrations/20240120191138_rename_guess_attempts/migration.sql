/*
  Warnings:

  - You are about to drop the column `guessAttempts` on the `SigninCode` table. All the data in the column will be lost.
  - Added the required column `usedGuessAttempts` to the `SigninCode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SigninCode" DROP COLUMN "guessAttempts",
ADD COLUMN     "usedGuessAttempts" INTEGER NOT NULL;
