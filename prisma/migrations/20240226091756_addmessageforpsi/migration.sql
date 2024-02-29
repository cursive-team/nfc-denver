-- CreateTable
CREATE TABLE "PsiMessage" (
    "id" SERIAL NOT NULL,
    "senderId" INTEGER NOT NULL,
    "recipientId" INTEGER NOT NULL,
    "compressedData" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PsiMessage_pkey" PRIMARY KEY ("id")
);
