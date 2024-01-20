-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "chipId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "encryptionPubKey" TEXT NOT NULL,
    "signaturePubKey" TEXT NOT NULL,
    "wantsServerStorage" BOOLEAN NOT NULL,
    "passwordSalt" TEXT,
    "passwordHash" TEXT,
    "twitterUsername" TEXT,
    "telegramUsername" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_chipId_key" ON "User"("chipId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
