-- CreateTable
CREATE TABLE "Item" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "sponsor" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "buildCost" INTEGER NOT NULL,
    "questRequirementIds" INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ItemQuestRequirements" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ItemQuestRequirements_AB_unique" ON "_ItemQuestRequirements"("A", "B");

-- CreateIndex
CREATE INDEX "_ItemQuestRequirements_B_index" ON "_ItemQuestRequirements"("B");

-- AddForeignKey
ALTER TABLE "_ItemQuestRequirements" ADD CONSTRAINT "_ItemQuestRequirements_A_fkey" FOREIGN KEY ("A") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ItemQuestRequirements" ADD CONSTRAINT "_ItemQuestRequirements_B_fkey" FOREIGN KEY ("B") REFERENCES "Quest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
