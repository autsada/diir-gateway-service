/*
  Warnings:

  - The primary key for the `ReadBookmark` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ReadBookmark` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ReadBookmark" DROP CONSTRAINT "ReadBookmark_pkey",
DROP COLUMN "id";
