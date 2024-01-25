/*
  Warnings:

  - Added the required column `name` to the `LocationRequirement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `UserRequirement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LocationRequirement" ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserRequirement" ADD COLUMN     "name" TEXT NOT NULL;
