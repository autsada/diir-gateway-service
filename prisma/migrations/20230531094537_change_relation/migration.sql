-- DropForeignKey
ALTER TABLE "DontRecommend" DROP CONSTRAINT "DontRecommend_requestorId_fkey";

-- AddForeignKey
ALTER TABLE "DontRecommend" ADD CONSTRAINT "DontRecommend_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
