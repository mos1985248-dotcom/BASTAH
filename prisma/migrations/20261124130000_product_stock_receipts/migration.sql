-- CreateTable
CREATE TABLE "product_stock_receipts" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "variantId" TEXT,
    "variantName" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitCostMinor" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_stock_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_stock_receipts_productId_createdAt_id_idx" ON "product_stock_receipts"("productId", "createdAt", "id");

-- CreateIndex
CREATE UNIQUE INDEX "product_stock_receipts_productId_requestId_key" ON "product_stock_receipts"("productId", "requestId");

-- AddForeignKey
ALTER TABLE "product_stock_receipts" ADD CONSTRAINT "product_stock_receipts_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product_stock_receipts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_stock_receipts"
  ADD CONSTRAINT "product_stock_receipts_positive_quantity" CHECK ("quantity" > 0),
  ADD CONSTRAINT "product_stock_receipts_nonnegative_cost" CHECK ("unitCostMinor" >= 0);
