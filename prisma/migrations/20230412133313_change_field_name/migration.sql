/*
  Warnings:

  - You are about to drop the column `originalName` on the `Station` table. All the data in the column will be lost.
  - Added the required column `displayName` to the `Station` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Station" DROP COLUMN "originalName",
ADD COLUMN     "displayName" TEXT NOT NULL;
