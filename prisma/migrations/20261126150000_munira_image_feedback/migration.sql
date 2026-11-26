ALTER TABLE "munira_images"
  ADD COLUMN "generationInput" JSONB,
  ADD COLUMN "feedbackStatus" TEXT,
  ADD COLUMN "feedbackNote" TEXT,
  ADD COLUMN "feedbackAt" TIMESTAMP(3);
