/*
  Warnings:

  - The required column `id` was added to the `DontRecommend` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "DontRecommend" ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "DontRecommend_pkey" PRIMARY KEY ("id");
