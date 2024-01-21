-- CreateTable
CREATE TABLE "Backup" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "encryptedData" TEXT NOT NULL,
    "authenticationTag" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "isServerEncrypted" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Backup_pkey" PRIMARY KEY ("id")
);
