CREATE TABLE "munira_knowledge_gaps" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "questionKey" TEXT NOT NULL UNIQUE,
  "question" TEXT NOT NULL,
  "occurrences" INTEGER NOT NULL DEFAULT 1,
  "resolved" BOOLEAN NOT NULL DEFAULT false,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "munira_knowledge_gaps_resolved_lastSeenAt_idx" ON "munira_knowledge_gaps"("resolved","lastSeenAt");
ALTER TABLE "munira_knowledge_gaps" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "munira_knowledge_gaps" FROM anon, authenticated;
