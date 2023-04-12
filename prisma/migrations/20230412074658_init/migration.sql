-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('TRADITIONAL', 'WALLET');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "owner" TEXT NOT NULL,
    "authUid" TEXT NOT NULL,
    "type" "AccountType" NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Station" (
    "id" SERIAL NOT NULL,
    "tokenId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "accountId" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "image" TEXT,
    "bannerImage" TEXT,

    CONSTRAINT "Station_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_owner_key" ON "Account"("owner");

-- CreateIndex
CREATE UNIQUE INDEX "Account_authUid_key" ON "Account"("authUid");

-- CreateIndex
CREATE UNIQUE INDEX "Station_tokenId_key" ON "Station"("tokenId");

-- CreateIndex
CREATE UNIQUE INDEX "Station_name_key" ON "Station"("name");

-- AddForeignKey
ALTER TABLE "Station" ADD CONSTRAINT "Station_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
