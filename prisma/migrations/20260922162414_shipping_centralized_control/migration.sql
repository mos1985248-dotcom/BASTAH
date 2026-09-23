-- AlterTable
ALTER TABLE "shipping_provider_configs" ADD COLUMN     "agentName" TEXT,
ADD COLUMN     "agentPhone" TEXT,
ADD COLUMN     "licenseNumber" TEXT,
ADD COLUMN     "serviceCity" TEXT,
ADD COLUMN     "vehiclePlate" TEXT,
ADD COLUMN     "vehicleType" TEXT;

-- CreateTable
CREATE TABLE "platform_carrier_credentials" (
    "id" TEXT NOT NULL,
    "carrier" "ShippingCarrier" NOT NULL,
    "credentialsEnc" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastTestedAt" TIMESTAMP(3),
    "lastTestOk" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_carrier_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "platform_carrier_credentials_carrier_key" ON "platform_carrier_credentials"("carrier");
