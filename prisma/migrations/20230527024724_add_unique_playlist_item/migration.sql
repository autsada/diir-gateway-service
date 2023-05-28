/*
  Warnings:

  - A unique constraint covering the columns `[publishId]` on the table `PlaylistItem` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PlaylistItem_publishId_key" ON "PlaylistItem"("publishId");
