-- CreateTable
CREATE TABLE "cart_contact_consents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "cart_contact_consents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cart_contact_consents_userId_storeId_key" ON "cart_contact_consents"("userId", "storeId");
CREATE INDEX "cart_contact_consents_storeId_idx" ON "cart_contact_consents"("storeId");

-- AddForeignKey
ALTER TABLE "cart_contact_consents" ADD CONSTRAINT "cart_contact_consents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cart_contact_consents" ADD CONSTRAINT "cart_contact_consents_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
