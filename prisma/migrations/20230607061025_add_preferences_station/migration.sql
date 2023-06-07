/*
  Warnings:

  - You are about to drop the column `primaryInterest` on the `Station` table. All the data in the column will be lost.
  - You are about to drop the column `secondaryInterest` on the `Station` table. All the data in the column will be lost.
  - You are about to drop the column `tertiaryInterest` on the `Station` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Station" DROP COLUMN "primaryInterest",
DROP COLUMN "secondaryInterest",
DROP COLUMN "tertiaryInterest",
ADD COLUMN     "preferences" "Category"[] DEFAULT ARRAY[]::"Category"[];
