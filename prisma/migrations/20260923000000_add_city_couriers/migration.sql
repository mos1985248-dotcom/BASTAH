-- CreateTable
CREATE TABLE "city_couriers" (
    "id" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "city_couriers_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "shipments" ADD COLUMN "courierId" TEXT;

-- CreateIndex
CREATE INDEX "city_couriers_city_isActive_idx" ON "city_couriers"("city", "isActive");

-- CreateIndex
CREATE INDEX "shipments_courierId_idx" ON "shipments"("courierId");

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "city_couriers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
