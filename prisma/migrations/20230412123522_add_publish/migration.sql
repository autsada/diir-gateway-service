-- CreateEnum
CREATE TYPE "Category" AS ENUM ('Music', 'Movies', 'Entertainment', 'Sports', 'Food', 'Travel', 'Gaming', 'News', 'Animals', 'Education', 'Science', 'Technology', 'Programming', 'LifeStyle', 'Vehicles', 'Children', 'Women', 'Men', 'Other');

-- CreateEnum
CREATE TYPE "PublishKind" AS ENUM ('Video', 'Audio', 'Blog', 'Course', 'Art', 'Adds', 'Podcast');

-- CreateEnum
CREATE TYPE "ThumbnailSource" AS ENUM ('generated', 'custom');

-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Station" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "PlaybackLink" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "thumbnail" TEXT NOT NULL,
    "preview" TEXT NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL,
    "hls" TEXT NOT NULL,
    "dash" TEXT NOT NULL,
    "publishId" TEXT NOT NULL,

    CONSTRAINT "PlaybackLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Publish" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "creatorId" TEXT NOT NULL,
    "rawContentURI" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "thumbSource" "ThumbnailSource" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "views" INTEGER,
    "primaryCategory" "Category" NOT NULL,
    "secondaryCategory" "Category",
    "kind" "PublishKind" NOT NULL,
    "public" BOOLEAN NOT NULL DEFAULT false,
    "uploadError" BOOLEAN NOT NULL DEFAULT false,
    "transcodError" BOOLEAN NOT NULL DEFAULT false,
    "uploading" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Publish_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlaybackLink_publishId_key" ON "PlaybackLink"("publishId");

-- AddForeignKey
ALTER TABLE "PlaybackLink" ADD CONSTRAINT "PlaybackLink_publishId_fkey" FOREIGN KEY ("publishId") REFERENCES "Publish"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publish" ADD CONSTRAINT "Publish_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;
