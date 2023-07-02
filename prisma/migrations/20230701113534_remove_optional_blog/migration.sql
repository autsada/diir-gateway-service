/*
  Warnings:

  - Made the column `content` on table `Blog` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Blog" ALTER COLUMN "content" SET NOT NULL;
