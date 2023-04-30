/*
  Warnings:

  - The `tokenId` column on the `Station` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Station" DROP COLUMN "tokenId",
ADD COLUMN     "tokenId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Station_tokenId_key" ON "Station"("tokenId");
