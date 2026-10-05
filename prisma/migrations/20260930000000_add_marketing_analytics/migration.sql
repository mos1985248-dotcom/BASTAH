-- CreateEnum
CREATE TYPE "AnalyticsEventType" AS ENUM (
  'STORE_VIEW', 'PRODUCT_VIEW', 'PRODUCT_CLICK', 'ADD_TO_CART',
  'CHECKOUT_STARTED', 'ORDER_CREATED', 'ORDER_PAID',
  'CONTENT_PRODUCT_CLICK', 'CAMPAIGN_CLICK'
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "type" "AnalyticsEventType" NOT NULL,
    "storeId" TEXT NOT NULL,
    "productId" TEXT,
    "orderId" TEXT,
    "campaignId" TEXT,
    "contentId" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "sessionId" TEXT,
    "amount" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_attributions" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "productId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_attributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing_provider_connections" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "credentialsEnc" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastTestedAt" TIMESTAMP(3),
    "lastTestOk" BOOLEAN,

    CONSTRAINT "marketing_provider_connections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "analytics_events_storeId_createdAt_idx" ON "analytics_events"("storeId", "createdAt");
CREATE INDEX "analytics_events_storeId_type_idx" ON "analytics_events"("storeId", "type");
CREATE INDEX "analytics_events_productId_idx" ON "analytics_events"("productId");
CREATE INDEX "analytics_events_utmSource_idx" ON "analytics_events"("utmSource");

-- CreateIndex
CREATE UNIQUE INDEX "order_attributions_orderId_key" ON "order_attributions"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "marketing_provider_connections_storeId_provider_key" ON "marketing_provider_connections"("storeId", "provider");

-- AddForeignKey
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "ad_campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "marketing_content"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_attributions" ADD CONSTRAINT "order_attributions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketing_provider_connections" ADD CONSTRAINT "marketing_provider_connections_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
