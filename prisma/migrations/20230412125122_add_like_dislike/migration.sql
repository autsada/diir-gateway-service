/*
  Warnings:

  - The values [Audio,Blog,Course,Art,Podcast] on the enum `PublishKind` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PublishKind_new" AS ENUM ('Video', 'Adds');
ALTER TABLE "Publish" ALTER COLUMN "kind" TYPE "PublishKind_new" USING ("kind"::text::"PublishKind_new");
ALTER TYPE "PublishKind" RENAME TO "PublishKind_old";
ALTER TYPE "PublishKind_new" RENAME TO "PublishKind";
DROP TYPE "PublishKind_old";
COMMIT;

-- CreateTable
CREATE TABLE "Like" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stationId" TEXT NOT NULL,
    "publishId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "DisLike" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishId" TEXT NOT NULL,
    "stationId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Like_stationId_publishId_key" ON "Like"("stationId", "publishId");

-- CreateIndex
CREATE UNIQUE INDEX "DisLike_publishId_stationId_key" ON "DisLike"("publishId", "stationId");

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_publishId_fkey" FOREIGN KEY ("publishId") REFERENCES "Publish"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisLike" ADD CONSTRAINT "DisLike_publishId_fkey" FOREIGN KEY ("publishId") REFERENCES "Publish"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisLike" ADD CONSTRAINT "DisLike_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;
