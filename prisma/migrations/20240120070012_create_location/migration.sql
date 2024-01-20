-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "chipId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sponsor" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "signaturePubKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Location_chipId_key" ON "Location"("chipId");
