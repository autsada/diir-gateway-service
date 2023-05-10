/*
  Warnings:

  - You are about to drop the column `public` on the `Publish` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('private', 'public');

-- AlterTable
ALTER TABLE "Publish" DROP COLUMN "public",
ADD COLUMN     "visibility" "Visibility" NOT NULL DEFAULT 'private';
