/*
  Warnings:

  - You are about to drop the column `bio` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `farcasterUsername` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `telegramUsername` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `twitterUsername` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "bio",
DROP COLUMN "farcasterUsername",
DROP COLUMN "telegramUsername",
DROP COLUMN "twitterUsername";
