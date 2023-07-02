-- AlterTable
ALTER TABLE "Publish" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "Blog" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "publishId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "preview" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Blog_publishId_key" ON "Blog"("publishId");

-- AddForeignKey
ALTER TABLE "Blog" ADD CONSTRAINT "Blog_publishId_fkey" FOREIGN KEY ("publishId") REFERENCES "Publish"("id") ON DELETE CASCADE ON UPDATE CASCADE;
