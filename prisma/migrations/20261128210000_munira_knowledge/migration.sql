CREATE TABLE "munira_knowledge_articles" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "question" TEXT NOT NULL,
  "questionKey" TEXT NOT NULL UNIQUE,
  "answer" TEXT NOT NULL,
  "aliases" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "published" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "munira_knowledge_articles_published_idx" ON "munira_knowledge_articles"("published");
ALTER TABLE "munira_knowledge_articles" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "munira_knowledge_articles" FROM anon, authenticated;
