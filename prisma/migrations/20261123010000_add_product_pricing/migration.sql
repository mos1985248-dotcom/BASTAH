-- CreateTable
CREATE TABLE "product_pricing" (
    "productId" TEXT NOT NULL,
    "inputs" JSONB NOT NULL,
    "productCostMinor" INTEGER NOT NULL,
    "unitCostMinor" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_pricing_pkey" PRIMARY KEY ("productId")
);

-- AddForeignKey
ALTER TABLE "product_pricing" ADD CONSTRAINT "product_pricing_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Cost inputs are read by authenticated seller routes through Prisma.
ALTER TABLE "product_pricing" ENABLE ROW LEVEL SECURITY;
