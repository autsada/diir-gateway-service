/*
  Warnings:

  - A unique constraint covering the columns `[displayName]` on the table `Station` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Station_displayName_key" ON "Station"("displayName");
