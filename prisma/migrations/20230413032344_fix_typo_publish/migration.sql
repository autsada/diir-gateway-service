/*
  Warnings:

  - You are about to drop the column `transcodError` on the `Publish` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Publish" DROP COLUMN "transcodError",
ADD COLUMN     "transcodeError" BOOLEAN NOT NULL DEFAULT false;
