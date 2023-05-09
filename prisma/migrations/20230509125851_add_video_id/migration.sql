/*
  Warnings:

  - Added the required column `videoId` to the `PlaybackLink` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PlaybackLink" ADD COLUMN     "videoId" TEXT NOT NULL;
