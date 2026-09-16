-- CreateEnum
CREATE TYPE "ShippingProviderType" AS ENUM ('REST', 'MANUAL');

-- AlterTable
ALTER TABLE "shipping_provider_configs" ADD COLUMN     "flatFee" DOUBLE PRECISION,
ADD COLUMN     "perKgFee" DOUBLE PRECISION,
ADD COLUMN     "providerType" "ShippingProviderType" NOT NULL DEFAULT 'REST',
ALTER COLUMN "baseUrl" DROP NOT NULL,
ALTER COLUMN "ratePath" DROP NOT NULL,
ALTER COLUMN "apiKeyEnc" DROP NOT NULL;
