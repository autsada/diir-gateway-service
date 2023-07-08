/*
  Warnings:

  - You are about to drop the column `stationId` on the `ReadBookmark` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[profileId,publishId]` on the table `ReadBookmark` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `profileId` to the `ReadBookmark` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ReadBookmark" DROP CONSTRAINT "ReadBookmark_stationId_fkey";

-- DropIndex
DROP INDEX "ReadBookmark_stationId_publishId_key";

-- AlterTable
ALTER TABLE "ReadBookmark" DROP COLUMN "stationId",
ADD COLUMN     "profileId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ReadBookmark_profileId_publishId_key" ON "ReadBookmark"("profileId", "publishId");

-- AddForeignKey
ALTER TABLE "ReadBookmark" ADD CONSTRAINT "ReadBookmark_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;
