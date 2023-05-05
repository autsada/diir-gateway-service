/*
  Warnings:

  - You are about to alter the column `name` on the `Station` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(64)`.
  - You are about to alter the column `displayName` on the `Station` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(64)`.

*/
-- AlterTable
ALTER TABLE "Station" ALTER COLUMN "name" SET DATA TYPE VARCHAR(64),
ALTER COLUMN "displayName" SET DATA TYPE VARCHAR(64);
