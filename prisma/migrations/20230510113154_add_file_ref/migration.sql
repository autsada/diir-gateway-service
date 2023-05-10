/*
  Warnings:

  - You are about to drop the column `rawContentURI` on the `Publish` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Publish" DROP COLUMN "rawContentURI",
ADD COLUMN     "contentRef" TEXT,
ADD COLUMN     "contentURI" TEXT,
ADD COLUMN     "thumbnailRef" TEXT;
