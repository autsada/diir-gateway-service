/*
  Warnings:

  - A unique constraint covering the columns `[ownerId,publishId]` on the table `PlaylistItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ownerId` to the `PlaylistItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "PlaylistItem_publishId_key";

-- AlterTable
ALTER TABLE "PlaylistItem" ADD COLUMN     "ownerId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistItem_ownerId_publishId_key" ON "PlaylistItem"("ownerId", "publishId");
