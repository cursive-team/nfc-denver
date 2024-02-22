/*
  Warnings:

  - Added the required column `fhePublicKeyShare` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `relinKeyPublicRound1` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "fhePublicKeyShare" TEXT NOT NULL,
ADD COLUMN     "relinKeyPublicRound1" TEXT NOT NULL;
