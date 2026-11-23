-- CreateEnum
CREATE TYPE "FinExpenseCategory" AS ENUM ('ESTABLISHMENT', 'OPERATIONS', 'AI', 'SALARIES');

-- CreateEnum
CREATE TYPE "FinExpenseKind" AS ENUM ('FIXED', 'VARIABLE');

-- CreateEnum
CREATE TYPE "FinExpenseStatus" AS ENUM ('PAID', 'UNPAID');

-- CreateEnum
CREATE TYPE "FinSettlementKind" AS ENUM ('COURIER_PAYOUT', 'COMMISSION_RECEIPT', 'LOCAL_DELIVERY_RECEIPT', 'COD_SHARE_RECEIPT', 'OTHER');

-- CreateEnum
CREATE TYPE "FinCodShareBasis" AS ENUM ('FIXED_ONLY', 'ORDER_TOTAL', 'COD_FEE');

-- CreateEnum
CREATE TYPE "FinAiCostStatus" AS ENUM ('COMPLETE', 'INCOMPLETE', 'LEGACY');

-- CreateEnum
CREATE TYPE "FinAiInvoiceKind" AS ENUM ('USAGE_INVOICE', 'PREPAID_TOPUP');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'FINANCE_EXPENSE_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'FINANCE_EXPENSE_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'FINANCE_EXPENSE_VOIDED';
ALTER TYPE "AuditAction" ADD VALUE 'FINANCE_SETTLEMENT_RECORDED';
ALTER TYPE "AuditAction" ADD VALUE 'FINANCE_SETTLEMENT_REVERSED';
ALTER TYPE "AuditAction" ADD VALUE 'FINANCE_REFUND_RECORDED';
ALTER TYPE "AuditAction" ADD VALUE 'FINANCE_REFUND_REVERSED';
ALTER TYPE "AuditAction" ADD VALUE 'FINANCE_COD_TERMS_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'FINANCE_AI_INVOICE_RECORDED';
ALTER TYPE "AuditAction" ADD VALUE 'FINANCE_SETTINGS_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'COURIER_ASSIGNED';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "codCarrierShare" DECIMAL(10,2),
ADD COLUMN     "codShareTerms" JSONB;

-- AlterTable
ALTER TABLE "ai_usage" ADD COLUMN     "cachedInputPriceUsdPerMTok" DECIMAL(12,6),
ADD COLUMN     "cachedInputTokens" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "costStatus" "FinAiCostStatus" NOT NULL DEFAULT 'LEGACY',
ADD COLUMN     "costUsd" DECIMAL(14,6),
ADD COLUMN     "inputPriceUsdPerMTok" DECIMAL(12,6),
ADD COLUMN     "isRetry" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "outputPriceUsdPerMTok" DECIMAL(12,6),
ADD COLUMN     "planAtCall" "SubscriptionPlan",
ADD COLUMN     "providerRequestId" TEXT,
ADD COLUMN     "requestKey" TEXT,
ADD COLUMN     "retryOfId" TEXT;

-- CreateTable
CREATE TABLE "platform_expenses" (
    "id" TEXT NOT NULL,
    "category" "FinExpenseCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "vatAmount" DECIMAL(12,2),
    "expenseDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "status" "FinExpenseStatus" NOT NULL DEFAULT 'UNPAID',
    "kind" "FinExpenseKind" NOT NULL DEFAULT 'FIXED',
    "reference" TEXT,
    "note" TEXT,
    "voidedAt" TIMESTAMP(3),
    "voidReason" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance_settlements" (
    "id" TEXT NOT NULL,
    "kind" "FinSettlementKind" NOT NULL,
    "partyType" TEXT NOT NULL,
    "partyRef" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "settledAt" TIMESTAMP(3) NOT NULL,
    "method" TEXT,
    "reference" TEXT,
    "note" TEXT,
    "isReversal" BOOLEAN NOT NULL DEFAULT false,
    "reversalOfId" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "finance_settlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance_settlement_allocations" (
    "id" TEXT NOT NULL,
    "settlementId" TEXT NOT NULL,
    "shipmentId" TEXT,
    "orderId" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "finance_settlement_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courier_assignments" (
    "id" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "courierId" TEXT NOT NULL,
    "wageSnapshot" DECIMAL(10,2),
    "deliveryFeeSnapshot" DECIMAL(10,2),
    "directCostSnapshot" DECIMAL(10,2),
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "supersededAt" TIMESTAMP(3),
    "supersededReason" TEXT,
    "createdById" TEXT,

    CONSTRAINT "courier_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carrier_cod_terms" (
    "id" TEXT NOT NULL,
    "carrierKey" TEXT NOT NULL,
    "fixedShare" DECIMAL(10,2),
    "percentShare" DECIMAL(6,3),
    "percentBasis" "FinCodShareBasis",
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "carrier_cod_terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_refunds" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "refundedAt" TIMESTAMP(3) NOT NULL,
    "reference" TEXT,
    "note" TEXT,
    "isReversal" BOOLEAN NOT NULL DEFAULT false,
    "reversalOfId" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_provider_invoices" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "kind" "FinAiInvoiceKind" NOT NULL,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "amountUsd" DECIMAL(14,4) NOT NULL,
    "fxRateSarPerUsd" DECIMAL(10,5),
    "fxRateDate" TIMESTAMP(3),
    "fxSource" TEXT,
    "paidAt" TIMESTAMP(3),
    "reference" TEXT,
    "note" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_provider_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "platform_expenses_expenseDate_idx" ON "platform_expenses"("expenseDate");

-- CreateIndex
CREATE INDEX "platform_expenses_paidAt_idx" ON "platform_expenses"("paidAt");

-- CreateIndex
CREATE INDEX "platform_expenses_category_expenseDate_idx" ON "platform_expenses"("category", "expenseDate");

-- CreateIndex
CREATE UNIQUE INDEX "finance_settlements_reversalOfId_key" ON "finance_settlements"("reversalOfId");

-- CreateIndex
CREATE UNIQUE INDEX "finance_settlements_idempotencyKey_key" ON "finance_settlements"("idempotencyKey");

-- CreateIndex
CREATE INDEX "finance_settlements_kind_settledAt_idx" ON "finance_settlements"("kind", "settledAt");

-- CreateIndex
CREATE INDEX "finance_settlements_partyType_partyRef_idx" ON "finance_settlements"("partyType", "partyRef");

-- CreateIndex
CREATE INDEX "finance_settlement_allocations_settlementId_idx" ON "finance_settlement_allocations"("settlementId");

-- CreateIndex
CREATE INDEX "finance_settlement_allocations_shipmentId_idx" ON "finance_settlement_allocations"("shipmentId");

-- CreateIndex
CREATE INDEX "courier_assignments_shipmentId_idx" ON "courier_assignments"("shipmentId");

-- CreateIndex
CREATE INDEX "courier_assignments_courierId_idx" ON "courier_assignments"("courierId");

-- CreateIndex
CREATE INDEX "carrier_cod_terms_carrierKey_effectiveFrom_idx" ON "carrier_cod_terms"("carrierKey", "effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_refunds_reversalOfId_key" ON "subscription_refunds"("reversalOfId");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_refunds_idempotencyKey_key" ON "subscription_refunds"("idempotencyKey");

-- CreateIndex
CREATE INDEX "subscription_refunds_invoiceId_idx" ON "subscription_refunds"("invoiceId");

-- CreateIndex
CREATE INDEX "subscription_refunds_refundedAt_idx" ON "subscription_refunds"("refundedAt");

-- CreateIndex
CREATE INDEX "ai_provider_invoices_provider_periodStart_idx" ON "ai_provider_invoices"("provider", "periodStart");

-- CreateIndex
CREATE INDEX "ai_provider_invoices_paidAt_idx" ON "ai_provider_invoices"("paidAt");

-- CreateIndex
CREATE UNIQUE INDEX "ai_usage_requestKey_key" ON "ai_usage"("requestKey");

-- AddForeignKey
ALTER TABLE "finance_settlement_allocations" ADD CONSTRAINT "finance_settlement_allocations_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "finance_settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Financial tables are accessed by the server through Prisma.
ALTER TABLE "platform_expenses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "finance_settlements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "finance_settlement_allocations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "courier_assignments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "carrier_cod_terms" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscription_refunds" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai_provider_invoices" ENABLE ROW LEVEL SECURITY;
