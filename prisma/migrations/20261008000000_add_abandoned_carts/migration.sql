-- CreateEnum
CREATE TYPE "AbandonedCartStatus" AS ENUM ('DETECTED', 'REMINDED', 'RECOVERED');

-- CreateTable
CREATE TABLE "abandoned_carts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "status" "AbandonedCartStatus" NOT NULL DEFAULT 'DETECTED',
    "itemCount" INTEGER NOT NULL,
    "cartValue" DOUBLE PRECISION NOT NULL,
    "cartUpdatedAt" TIMESTAMP(3) NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remindedAt" TIMESTAMP(3),
    "merchantEventSentAt" TIMESTAMP(3),
    "recoveredAt" TIMESTAMP(3),
    "recoveredOrderId" TEXT,
    "recoveredValue" DOUBLE PRECISION,

    CONSTRAINT "abandoned_carts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "abandoned_carts_userId_storeId_key" ON "abandoned_carts"("userId", "storeId");
CREATE INDEX "abandoned_carts_storeId_detectedAt_idx" ON "abandoned_carts"("storeId", "detectedAt");
CREATE INDEX "abandoned_carts_status_idx" ON "abandoned_carts"("status");

-- AddForeignKey
ALTER TABLE "abandoned_carts" ADD CONSTRAINT "abandoned_carts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "abandoned_carts" ADD CONSTRAINT "abandoned_carts_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
