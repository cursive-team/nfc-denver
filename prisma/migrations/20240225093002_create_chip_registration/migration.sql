-- CreateTable
CREATE TABLE "CmacChipRegistration" (
    "id" SERIAL NOT NULL,
    "chipId" TEXT NOT NULL,
    "isLocationChip" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CmacChipRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SigChipRegistration" (
    "id" SERIAL NOT NULL,
    "signaturePublicKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SigChipRegistration_pkey" PRIMARY KEY ("id")
);
