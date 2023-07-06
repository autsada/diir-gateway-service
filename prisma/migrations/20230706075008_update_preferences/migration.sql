/*
  Warnings:

  - You are about to drop the column `preferences` on the `Station` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "Category" ADD VALUE 'Blockchain';

-- AlterTable
ALTER TABLE "Station" DROP COLUMN "preferences",
ADD COLUMN     "readPreferences" "Category"[] DEFAULT ARRAY[]::"Category"[],
ADD COLUMN     "watchPreferences" "Category"[] DEFAULT ARRAY[]::"Category"[];
