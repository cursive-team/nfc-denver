-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "displayEmailWalletLink" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "EmailWalletMint" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "locationId" INTEGER NOT NULL,
    "sigHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailWalletMint_pkey" PRIMARY KEY ("id")
);
