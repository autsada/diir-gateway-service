/*
  Warnings:

  - You are about to alter the column `content` on the `Blog` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(8000)`.
  - Added the required column `title` to the `Blog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Blog" ADD COLUMN     "title" VARCHAR(128) NOT NULL,
ALTER COLUMN "content" SET DATA TYPE VARCHAR(8000);
