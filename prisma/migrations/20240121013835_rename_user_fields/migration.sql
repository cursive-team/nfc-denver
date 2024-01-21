/*
  Warnings:

  - You are about to drop the column `signaturePubKey` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `encryptionPubKey` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `signaturePubKey` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `wantsServerStorage` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `SigninCode` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `signaturePublicKey` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `encryptionPublicKey` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `signaturePublicKey` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wantsServerCustody` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Location" DROP COLUMN "signaturePubKey",
ADD COLUMN     "signaturePublicKey" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "encryptionPubKey",
DROP COLUMN "signaturePubKey",
DROP COLUMN "wantsServerStorage",
ADD COLUMN     "encryptionPublicKey" TEXT NOT NULL,
ADD COLUMN     "signaturePublicKey" TEXT NOT NULL,
ADD COLUMN     "wantsServerCustody" BOOLEAN NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "SigninCode_email_key" ON "SigninCode"("email");
