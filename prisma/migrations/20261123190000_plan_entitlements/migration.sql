-- CreateTable
CREATE TABLE "platform_features" (
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "platform_features_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "plan_features" (
    "featureKey" TEXT NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "limit" INTEGER,

    CONSTRAINT "plan_features_pkey" PRIMARY KEY ("featureKey","plan")
);

-- CreateTable
CREATE TABLE "store_feature_overrides" (
    "featureKey" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "limit" INTEGER,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),

    CONSTRAINT "store_feature_overrides_pkey" PRIMARY KEY ("storeId","featureKey")
);

-- CreateTable
CREATE TABLE "feature_changes" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feature_changes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "launch_promotions" (
    "seat" INTEGER NOT NULL,
    "storeId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "identityHash" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "grantedBy" TEXT NOT NULL,

    CONSTRAINT "launch_promotions_pkey" PRIMARY KEY ("seat")
);

-- CreateTable
CREATE TABLE "cart_reminder_attempts" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "cartUpdatedAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cart_reminder_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "feature_changes_createdAt_idx" ON "feature_changes"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "launch_promotions_storeId_key" ON "launch_promotions"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "launch_promotions_merchantId_key" ON "launch_promotions"("merchantId");

-- CreateIndex
CREATE UNIQUE INDEX "launch_promotions_identityHash_key" ON "launch_promotions"("identityHash");

-- CreateIndex
CREATE INDEX "cart_reminder_attempts_cartId_cartUpdatedAt_createdAt_idx" ON "cart_reminder_attempts"("cartId", "cartUpdatedAt", "createdAt");

-- AddForeignKey
ALTER TABLE "plan_features" ADD CONSTRAINT "plan_features_featureKey_fkey" FOREIGN KEY ("featureKey") REFERENCES "platform_features"("key") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_feature_overrides" ADD CONSTRAINT "store_feature_overrides_featureKey_fkey" FOREIGN KEY ("featureKey") REFERENCES "platform_features"("key") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_feature_overrides" ADD CONSTRAINT "store_feature_overrides_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_reminder_attempts" ADD CONSTRAINT "cart_reminder_attempts_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "abandoned_carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;


ALTER TABLE "launch_promotions" ADD CONSTRAINT "launch_promotion_seat_range" CHECK ("seat" BETWEEN 1 AND 50);
ALTER TABLE "launch_promotions" ADD CONSTRAINT "launch_promotion_dates" CHECK ("endsAt" > "startsAt");
ALTER TABLE "platform_features" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "plan_features" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "store_feature_overrides" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "feature_changes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "launch_promotions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cart_reminder_attempts" ENABLE ROW LEVEL SECURITY;
