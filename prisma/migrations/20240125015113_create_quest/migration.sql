-- CreateTable
CREATE TABLE "Quest" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sponsor" TEXT,
    "imageUrl" TEXT,
    "summonId" TEXT,
    "buidlReward" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Quest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRequirement" (
    "id" SERIAL NOT NULL,
    "questId" INTEGER NOT NULL,
    "userIds" INTEGER[],
    "numSigsRequired" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocationRequirement" (
    "id" SERIAL NOT NULL,
    "questId" INTEGER NOT NULL,
    "locationIds" INTEGER[],
    "numSigsRequired" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LocationRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserQuestRequirements" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_LocationQuestRequirements" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Quest_summonId_key" ON "Quest"("summonId");

-- CreateIndex
CREATE UNIQUE INDEX "_UserQuestRequirements_AB_unique" ON "_UserQuestRequirements"("A", "B");

-- CreateIndex
CREATE INDEX "_UserQuestRequirements_B_index" ON "_UserQuestRequirements"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_LocationQuestRequirements_AB_unique" ON "_LocationQuestRequirements"("A", "B");

-- CreateIndex
CREATE INDEX "_LocationQuestRequirements_B_index" ON "_LocationQuestRequirements"("B");

-- AddForeignKey
ALTER TABLE "UserRequirement" ADD CONSTRAINT "UserRequirement_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationRequirement" ADD CONSTRAINT "LocationRequirement_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserQuestRequirements" ADD CONSTRAINT "_UserQuestRequirements_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserQuestRequirements" ADD CONSTRAINT "_UserQuestRequirements_B_fkey" FOREIGN KEY ("B") REFERENCES "UserRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LocationQuestRequirements" ADD CONSTRAINT "_LocationQuestRequirements_A_fkey" FOREIGN KEY ("A") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LocationQuestRequirements" ADD CONSTRAINT "_LocationQuestRequirements_B_fkey" FOREIGN KEY ("B") REFERENCES "LocationRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
