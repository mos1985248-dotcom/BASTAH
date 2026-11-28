CREATE TABLE "daftari_cash_entries" (
 "id" TEXT PRIMARY KEY,
 "storeId" TEXT NOT NULL REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 "requestId" TEXT NOT NULL,
 "direction" TEXT NOT NULL CHECK ("direction" IN ('IN','OUT')),
 "category" TEXT NOT NULL,
 "amountMinor" BIGINT NOT NULL CHECK ("amountMinor">0),
 "occurredAt" TIMESTAMP(3) NOT NULL,
 "description" TEXT,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "daftari_cash_entries_storeId_requestId_key" ON "daftari_cash_entries"("storeId","requestId");
CREATE INDEX "daftari_cash_entries_storeId_occurredAt_idx" ON "daftari_cash_entries"("storeId","occurredAt");
