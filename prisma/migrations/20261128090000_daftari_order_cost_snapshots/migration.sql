CREATE TABLE "daftari_order_item_costs" (
 "orderItemId" TEXT NOT NULL PRIMARY KEY,
 "productCostMinor" INTEGER NOT NULL CHECK ("productCostMinor" >= 0),
 "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "daftari_order_item_costs_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
