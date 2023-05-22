/*
  Warnings:

  - The required column `id` was added to the `WatchLater` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropIndex
DROP INDEX "WatchLater_stationId_publishId_key";

-- AlterTable
ALTER TABLE "WatchLater" ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "WatchLater_pkey" PRIMARY KEY ("id");
