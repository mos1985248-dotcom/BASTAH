BEGIN;

CREATE TABLE "store_sections" (
  "id" TEXT NOT NULL,
  "storeId" TEXT NOT NULL REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "name" VARCHAR(60) NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "store_sections_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "store_sections" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "store_sections" FROM PUBLIC, anon, authenticated;

CREATE UNIQUE INDEX "store_sections_storeId_id_key" ON "store_sections"("storeId", "id");
CREATE UNIQUE INDEX "store_sections_storeId_name_key" ON "store_sections"("storeId", "name");

ALTER TABLE "products" ADD COLUMN "storeSectionId" TEXT;
ALTER TABLE "products" ADD CONSTRAINT "products_storeId_storeSectionId_fkey"
  FOREIGN KEY ("storeId", "storeSectionId") REFERENCES "store_sections"("storeId", "id")
  ON DELETE NO ACTION ON UPDATE CASCADE;
CREATE INDEX "products_storeId_storeSectionId_status_idx" ON "products"("storeId", "storeSectionId", "status");

COMMIT;
