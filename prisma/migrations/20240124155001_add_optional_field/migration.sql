-- AlterTable
ALTER TABLE "Quest" ALTER COLUMN "summonId" DROP NOT NULL,
ALTER COLUMN "sponsor" DROP NOT NULL,
ALTER COLUMN "imageUrl" DROP NOT NULL,
ALTER COLUMN "userPartialCt" DROP NOT NULL,
ALTER COLUMN "locationPartialCt" DROP NOT NULL;
