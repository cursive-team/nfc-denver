-- CreateTable
CREATE TABLE "BenchmarkMessage" (
    "id" SERIAL NOT NULL,
    "benchmarkId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,
    "recipientId" INTEGER NOT NULL,
    "encryptedData" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BenchmarkMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BenchmarkMessage" ADD CONSTRAINT "BenchmarkMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BenchmarkMessage" ADD CONSTRAINT "BenchmarkMessage_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
