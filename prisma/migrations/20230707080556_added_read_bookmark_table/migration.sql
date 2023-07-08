-- CreateTable
CREATE TABLE "ReadBookmark" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stationId" TEXT NOT NULL,
    "publishId" TEXT NOT NULL,

    CONSTRAINT "ReadBookmark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReadBookmark_stationId_publishId_key" ON "ReadBookmark"("stationId", "publishId");

-- AddForeignKey
ALTER TABLE "ReadBookmark" ADD CONSTRAINT "ReadBookmark_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadBookmark" ADD CONSTRAINT "ReadBookmark_publishId_fkey" FOREIGN KEY ("publishId") REFERENCES "Publish"("id") ON DELETE CASCADE ON UPDATE CASCADE;
