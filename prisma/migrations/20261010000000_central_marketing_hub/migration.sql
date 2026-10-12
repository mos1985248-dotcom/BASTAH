-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'MARKETING_HUB_CONFIGURED';

-- CreateTable
CREATE TABLE "store_marketing_links" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "store_marketing_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "store_marketing_links_storeId_platform_key" ON "store_marketing_links"("storeId", "platform");
CREATE INDEX "store_marketing_links_storeId_idx" ON "store_marketing_links"("storeId");

-- AddForeignKey
ALTER TABLE "store_marketing_links" ADD CONSTRAINT "store_marketing_links_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
