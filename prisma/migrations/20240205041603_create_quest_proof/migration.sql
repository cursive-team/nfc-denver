-- CreateTable
CREATE TABLE "QuestProof" (
    "id" TEXT NOT NULL,
    "questId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "serializedProof" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestProof_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuestProof" ADD CONSTRAINT "QuestProof_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestProof" ADD CONSTRAINT "QuestProof_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
