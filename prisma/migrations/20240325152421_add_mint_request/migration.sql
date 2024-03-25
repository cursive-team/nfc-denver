-- CreateTable
CREATE TABLE "MintRequest" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "stringifiedPublicKeys" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MintRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MintRequest" ADD CONSTRAINT "MintRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
