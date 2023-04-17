/*
  Warnings:

  - Added the required column `from` to the `Tip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `to` to the `Tip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tip" ADD COLUMN     "from" TEXT NOT NULL,
ADD COLUMN     "to" TEXT NOT NULL;
