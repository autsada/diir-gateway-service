/*
  Warnings:

  - A unique constraint covering the columns `[submittedById,publishId,reason]` on the table `Report` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Report_submittedById_publishId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Report_submittedById_publishId_reason_key" ON "Report"("submittedById", "publishId", "reason");
