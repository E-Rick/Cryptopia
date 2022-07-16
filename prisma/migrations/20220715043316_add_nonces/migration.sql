/*
  Warnings:

  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[address]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "password",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "coverImageUrl" TEXT,
ADD COLUMN     "nonce" INTEGER NOT NULL DEFAULT 999,
ADD COLUMN     "profileImageUrl" TEXT,
ADD COLUMN     "token" TEXT,
ADD COLUMN     "username" TEXT,
ADD COLUMN     "website" TEXT,
ALTER COLUMN "email" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_address_key" ON "User"("address");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
