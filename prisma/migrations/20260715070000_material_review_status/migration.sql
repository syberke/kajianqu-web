ALTER TABLE "materials"
  ADD COLUMN IF NOT EXISTS "review_status" TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS "review_note" TEXT;

CREATE INDEX IF NOT EXISTS "materials_review_status_created_at_idx"
  ON "materials" ("review_status", "created_at");
