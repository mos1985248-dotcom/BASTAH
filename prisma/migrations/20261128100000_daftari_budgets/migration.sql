CREATE TABLE "daftari_budgets" (
 "storeId" TEXT NOT NULL REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 "year" INTEGER NOT NULL,
 "month" INTEGER NOT NULL CHECK ("month" BETWEEN 1 AND 12),
 "revenueMinor" BIGINT NOT NULL CHECK ("revenueMinor">=0),
 "expensesMinor" BIGINT NOT NULL CHECK ("expensesMinor">=0),
 "updatedAt" TIMESTAMP(3) NOT NULL,
 PRIMARY KEY ("storeId","year","month")
);
