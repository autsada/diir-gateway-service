/*
  Warnings:

  - You are about to drop the column `title` on the `Blog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Blog" DROP COLUMN "title";

-- AlterTable
ALTER TABLE "Publish" ALTER COLUMN "title" SET DATA TYPE VARCHAR(128);
