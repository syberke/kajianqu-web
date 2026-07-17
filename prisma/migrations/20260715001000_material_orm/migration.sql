-- Extend the existing materials domain from the columns already consumed by KajianQu.
CREATE TABLE IF NOT EXISTS "keilmuan" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "nama" TEXT NOT NULL
);

ALTER TABLE "materials" ADD COLUMN IF NOT EXISTS "summary" TEXT;
ALTER TABLE "materials" ADD COLUMN IF NOT EXISTS "type" TEXT;
ALTER TABLE "materials" ADD COLUMN IF NOT EXISTS "is_published" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "materials" ADD COLUMN IF NOT EXISTS "keilmuan_id" UUID;
ALTER TABLE "materials" ADD COLUMN IF NOT EXISTS "asatidz_id" UUID;
ALTER TABLE "materials" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS "materials_asatidz_id_created_at_idx" ON "materials"("asatidz_id", "created_at");
CREATE INDEX IF NOT EXISTS "materials_keilmuan_id_idx" ON "materials"("keilmuan_id");
CREATE INDEX IF NOT EXISTS "materials_is_published_created_at_idx" ON "materials"("is_published", "created_at");
