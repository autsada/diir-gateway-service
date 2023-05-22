-- CreateTable
CREATE TABLE "WatchLater" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stationId" TEXT NOT NULL,
    "publishId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "WatchLater_stationId_publishId_key" ON "WatchLater"("stationId", "publishId");

-- AddForeignKey
ALTER TABLE "WatchLater" ADD CONSTRAINT "WatchLater_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchLater" ADD CONSTRAINT "WatchLater_publishId_fkey" FOREIGN KEY ("publishId") REFERENCES "Publish"("id") ON DELETE CASCADE ON UPDATE CASCADE;
