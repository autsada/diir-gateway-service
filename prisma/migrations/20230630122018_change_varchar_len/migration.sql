/*
  Warnings:

  - You are about to alter the column `preview` on the `Blog` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(10000)`.

*/
-- AlterTable
ALTER TABLE "Blog" ALTER COLUMN "content" SET DATA TYPE VARCHAR(10000),
ALTER COLUMN "preview" SET DATA TYPE VARCHAR(10000);
