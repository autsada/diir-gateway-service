/*
  Warnings:

  - A unique constraint covering the columns `[name,ownerId]` on the table `Playlist` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Playlist_name_ownerId_key" ON "Playlist"("name", "ownerId");
