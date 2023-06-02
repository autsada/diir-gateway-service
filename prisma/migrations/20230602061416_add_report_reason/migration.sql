/*
  Warnings:

  - Added the required column `reason` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('adult', 'violent', 'harass', 'hateful', 'harmful', 'abuse', 'terrorism', 'spam', 'mislead');

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "reason" "ReportReason" NOT NULL;
