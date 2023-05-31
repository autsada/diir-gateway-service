-- CreateTable
CREATE TABLE "DontRecommend" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestorId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "DontRecommend_requestorId_targetId_key" ON "DontRecommend"("requestorId", "targetId");

-- AddForeignKey
ALTER TABLE "DontRecommend" ADD CONSTRAINT "DontRecommend_requestorId_fkey" FOREIGN KEY ("requestorId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
