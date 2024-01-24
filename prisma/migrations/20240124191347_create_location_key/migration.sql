-- CreateTable
CREATE TABLE "LocationKey" (
    "id" SERIAL NOT NULL,
    "locationId" INTEGER NOT NULL,
    "signaturePrivateKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LocationKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LocationKey_locationId_key" ON "LocationKey"("locationId");

-- AddForeignKey
ALTER TABLE "LocationKey" ADD CONSTRAINT "LocationKey_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
