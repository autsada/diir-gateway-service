/*
  Warnings:

  - The primary key for the `Station` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Station" DROP CONSTRAINT "Station_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "tokenId" DROP NOT NULL,
ADD CONSTRAINT "Station_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Station_id_seq";
