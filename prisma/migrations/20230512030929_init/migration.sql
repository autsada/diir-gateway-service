-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('TRADITIONAL', 'WALLET');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('Music', 'Movies', 'Entertainment', 'Sports', 'Food', 'Travel', 'Gaming', 'News', 'Animals', 'Education', 'Science', 'Technology', 'Programming', 'LifeStyle', 'Vehicles', 'Children', 'Women', 'Men', 'Other');

-- CreateEnum
CREATE TYPE "PublishKind" AS ENUM ('Video', 'Adds', 'Blog', 'Podcast', 'Short');

-- CreateEnum
CREATE TYPE "ThumbnailSource" AS ENUM ('generated', 'custom');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('draft', 'private', 'public');

-- CreateEnum
CREATE TYPE "CommentType" AS ENUM ('PUBLISH', 'COMMENT');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "owner" TEXT NOT NULL,
    "authUid" TEXT,
    "type" "AccountType" NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Station" (
    "id" TEXT NOT NULL,
    "tokenId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "owner" TEXT NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "displayName" VARCHAR(64) NOT NULL,
    "image" TEXT,
    "imageRef" TEXT,
    "bannerImage" TEXT,
    "bannerImageRef" TEXT,
    "defaultColor" TEXT,
    "accountId" TEXT NOT NULL,
    "primaryInterest" "Category",
    "secondaryInterest" "Category",
    "tertiaryInterest" "Category",

    CONSTRAINT "Station_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Follow" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("followerId","followingId")
);

-- CreateTable
CREATE TABLE "PlaybackLink" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "videoId" TEXT NOT NULL,
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
    "contentURI" TEXT,
    "contentRef" TEXT,
    "filename" TEXT,
    "thumbnail" TEXT,
    "thumbnailRef" TEXT,
    "thumbSource" "ThumbnailSource" NOT NULL DEFAULT 'generated',
    "title" VARCHAR(100),
    "description" VARCHAR(5000),
    "views" INTEGER NOT NULL DEFAULT 0,
    "primaryCategory" "Category",
    "secondaryCategory" "Category",
    "kind" "PublishKind",
    "visibility" "Visibility" NOT NULL DEFAULT 'private',
    "uploadError" BOOLEAN NOT NULL DEFAULT false,
    "transcodeError" BOOLEAN NOT NULL DEFAULT false,
    "uploading" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Publish_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Like" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stationId" TEXT NOT NULL,
    "publishId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "DisLike" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishId" TEXT NOT NULL,
    "stationId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Tip" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "senderId" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "publishId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "fee" TEXT NOT NULL,

    CONSTRAINT "Tip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "creatorId" TEXT NOT NULL,
    "publishId" TEXT NOT NULL,
    "commentId" TEXT,
    "content" TEXT NOT NULL,
    "commentType" "CommentType" NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommentLike" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "commentId" TEXT NOT NULL,
    "stationId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "CommentDisLike" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "commentId" TEXT NOT NULL,
    "stationId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_owner_key" ON "Account"("owner");

-- CreateIndex
CREATE UNIQUE INDEX "Account_authUid_key" ON "Account"("authUid");

-- CreateIndex
CREATE UNIQUE INDEX "Station_tokenId_key" ON "Station"("tokenId");

-- CreateIndex
CREATE UNIQUE INDEX "Station_name_key" ON "Station"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Station_displayName_key" ON "Station"("displayName");

-- CreateIndex
CREATE UNIQUE INDEX "PlaybackLink_publishId_key" ON "PlaybackLink"("publishId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_stationId_publishId_key" ON "Like"("stationId", "publishId");

-- CreateIndex
CREATE UNIQUE INDEX "DisLike_publishId_stationId_key" ON "DisLike"("publishId", "stationId");

-- CreateIndex
CREATE UNIQUE INDEX "CommentLike_commentId_stationId_key" ON "CommentLike"("commentId", "stationId");

-- CreateIndex
CREATE UNIQUE INDEX "CommentDisLike_commentId_stationId_key" ON "CommentDisLike"("commentId", "stationId");

-- AddForeignKey
ALTER TABLE "Station" ADD CONSTRAINT "Station_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaybackLink" ADD CONSTRAINT "PlaybackLink_publishId_fkey" FOREIGN KEY ("publishId") REFERENCES "Publish"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publish" ADD CONSTRAINT "Publish_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_publishId_fkey" FOREIGN KEY ("publishId") REFERENCES "Publish"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisLike" ADD CONSTRAINT "DisLike_publishId_fkey" FOREIGN KEY ("publishId") REFERENCES "Publish"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisLike" ADD CONSTRAINT "DisLike_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tip" ADD CONSTRAINT "Tip_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tip" ADD CONSTRAINT "Tip_publishId_fkey" FOREIGN KEY ("publishId") REFERENCES "Publish"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tip" ADD CONSTRAINT "Tip_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_publishId_fkey" FOREIGN KEY ("publishId") REFERENCES "Publish"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentLike" ADD CONSTRAINT "CommentLike_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentLike" ADD CONSTRAINT "CommentLike_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentDisLike" ADD CONSTRAINT "CommentDisLike_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentDisLike" ADD CONSTRAINT "CommentDisLike_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;
