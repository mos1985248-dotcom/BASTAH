-- AlterTable
ALTER TABLE "marketing_content" ADD COLUMN     "body" TEXT,
ADD COLUMN     "kind" TEXT;

-- AlterTable
ALTER TABLE "ad_campaigns" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "content" TEXT,
ADD COLUMN     "objective" TEXT;
