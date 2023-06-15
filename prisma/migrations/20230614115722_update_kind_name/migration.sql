/*
  Warnings:

  - The values [Adds] on the enum `PublishKind` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PublishKind_new" AS ENUM ('Video', 'Ads', 'Blog', 'Podcast', 'Short');
ALTER TABLE "Publish" ALTER COLUMN "kind" TYPE "PublishKind_new" USING ("kind"::text::"PublishKind_new");
ALTER TYPE "PublishKind" RENAME TO "PublishKind_old";
ALTER TYPE "PublishKind_new" RENAME TO "PublishKind";
DROP TYPE "PublishKind_old";
COMMIT;
