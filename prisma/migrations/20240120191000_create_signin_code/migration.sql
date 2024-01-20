-- CreateTable
CREATE TABLE "SigninCode" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "guessAttempts" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "redeemedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SigninCode_pkey" PRIMARY KEY ("id")
);
