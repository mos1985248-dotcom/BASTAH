BEGIN;

ALTER TABLE "support_tickets"
  ALTER COLUMN "userId" DROP NOT NULL,
  ADD COLUMN "guestEmail" TEXT,
  ADD CONSTRAINT "support_tickets_account_or_guest_check" CHECK (
    ("userId" IS NOT NULL AND "guestEmail" IS NULL)
    OR ("userId" IS NULL AND "guestEmail" IS NOT NULL)
  );

ALTER TABLE "ticket_messages" ALTER COLUMN "userId" DROP NOT NULL;

ALTER TABLE "support_tickets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ticket_messages" ENABLE ROW LEVEL SECURITY;

COMMIT;
