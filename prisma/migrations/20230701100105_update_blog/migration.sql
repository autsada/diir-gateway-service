/*
  Warnings:

  - You are about to drop the column `preview` on the `Blog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Blog" DROP COLUMN "preview",
ALTER COLUMN "content" SET DATA TYPE VARCHAR(60000);
