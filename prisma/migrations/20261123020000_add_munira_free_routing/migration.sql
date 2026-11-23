-- AlterTable
ALTER TABLE "subscription_plan_configs" ADD COLUMN     "muniraMonthlyMessages" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "muniraTrialMessages" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "munira_models" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "apiKeyEnc" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "lastCheckedAt" TIMESTAMP(3),
    "freeVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastError" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "munira_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "munira_requests" (
    "scope" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "inputHash" TEXT NOT NULL,
    "quotaWindow" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "lease" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "sessionId" TEXT,
    "response" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "munira_requests_pkey" PRIMARY KEY ("scope","requestId")
);

-- CreateIndex
CREATE UNIQUE INDEX "munira_models_provider_model_key" ON "munira_models"("provider", "model");

-- CreateIndex
CREATE INDEX "munira_requests_scope_quotaWindow_state_expiresAt_idx" ON "munira_requests"("scope", "quotaWindow", "state", "expiresAt");


ALTER TABLE "munira_models" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "munira_requests" ENABLE ROW LEVEL SECURITY;

UPDATE "subscription_plan_configs"
SET "muniraMonthlyMessages" = CASE "plan" WHEN 'GROWTH' THEN 100 WHEN 'PRO' THEN 200 ELSE 0 END,
    "muniraTrialMessages" = CASE "plan" WHEN 'STARTER' THEN 5 ELSE 0 END,
    "hasAIFeatures" = "plan" <> 'FREE';
