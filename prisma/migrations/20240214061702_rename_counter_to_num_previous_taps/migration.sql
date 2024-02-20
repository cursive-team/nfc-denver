/*
  Warnings:

  - You are about to drop the column `counter` on the `LocationKey` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LocationKey" DROP COLUMN "counter",
ADD COLUMN     "numPreviousTaps" INTEGER NOT NULL DEFAULT 0;
