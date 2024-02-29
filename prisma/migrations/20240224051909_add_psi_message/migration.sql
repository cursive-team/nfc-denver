/*
  Warnings:

  - Added the required column `psiRound1Message` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "psiRound1Message" TEXT NOT NULL;
