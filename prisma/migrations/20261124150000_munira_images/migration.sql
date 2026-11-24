-- AlterTable
ALTER TABLE "subscription_plan_configs" ADD COLUMN     "muniraMonthlyImages" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "munira_images" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "inputHash" TEXT NOT NULL,
    "window" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "plan" "SubscriptionPlan",
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "neurons" INTEGER NOT NULL,
    "measuredNeurons" INTEGER,
    "estimatedNeurons" INTEGER,
    "error" TEXT,
    "objectPath" TEXT,
    "saved" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "munira_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "munira_images_scope_window_state_idx" ON "munira_images"("scope", "window", "state");

-- CreateIndex
CREATE INDEX "munira_images_day_provider_idx" ON "munira_images"("day", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "munira_images_scope_requestId_key" ON "munira_images"("scope", "requestId");

ALTER TABLE "munira_images" ENABLE ROW LEVEL SECURITY;
UPDATE "subscription_plan_configs" SET "muniraMonthlyImages" = CASE
  WHEN plan = 'GROWTH' THEN 20 WHEN plan = 'PRO' THEN 40 ELSE 0 END;

DO $$
BEGIN
  IF to_regclass('storage.buckets') IS NOT NULL THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES ('munira-private', 'munira-private', false, 2097152, ARRAY['image/webp'])
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
