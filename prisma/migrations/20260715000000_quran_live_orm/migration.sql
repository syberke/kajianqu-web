-- Baseline the ORM-owned core tables without renaming existing Supabase tables.
CREATE TABLE IF NOT EXISTS "profiles" (
  "id" UUID PRIMARY KEY,
  "nama" TEXT,
  "email" TEXT,
  "foto_url" TEXT,
  "role" TEXT
);

CREATE INDEX IF NOT EXISTS "profiles_role_idx" ON "profiles"("role");

CREATE TABLE IF NOT EXISTS "quran_sessions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "mode" TEXT NOT NULL,
  "surah_id" INTEGER NOT NULL,
  "surah_name" TEXT NOT NULL,
  "ayah_start" INTEGER NOT NULL,
  "ayah_end" INTEGER NOT NULL,
  "total_words" INTEGER NOT NULL,
  "correct_words" INTEGER NOT NULL,
  "accuracy" DOUBLE PRECISION NOT NULL,
  "mistakes" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "transcript" TEXT,
  "duration_seconds" INTEGER,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "quran_sessions" ADD COLUMN IF NOT EXISTS "transcript" TEXT;

CREATE TABLE IF NOT EXISTS "quran_mistakes" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "session_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "surah_id" INTEGER NOT NULL,
  "ayah_number" INTEGER NOT NULL,
  "word_arabic" TEXT NOT NULL,
  "word_spoken" TEXT NOT NULL,
  "kind" TEXT,
  "confidence" DOUBLE PRECISION,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "quran_mistakes_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "quran_sessions"("id") ON DELETE CASCADE
);

ALTER TABLE "quran_mistakes" ADD COLUMN IF NOT EXISTS "kind" TEXT;
ALTER TABLE "quran_mistakes" ADD COLUMN IF NOT EXISTS "confidence" DOUBLE PRECISION;

CREATE INDEX IF NOT EXISTS "quran_sessions_user_id_created_at_idx" ON "quran_sessions"("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "quran_mistakes_user_id_created_at_idx" ON "quran_mistakes"("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "quran_mistakes_session_id_idx" ON "quran_mistakes"("session_id");

CREATE TABLE IF NOT EXISTS "notifications" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "type" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "is_read" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "notifications_created_at_idx" ON "notifications"("created_at");

CREATE TABLE IF NOT EXISTS "settings" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "key" TEXT NOT NULL UNIQUE,
  "value" TEXT NOT NULL,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "activity_logs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "activity_logs_created_at_idx" ON "activity_logs"("created_at");

CREATE TABLE IF NOT EXISTS "donations" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "donor_name" TEXT,
  "nominal" NUMERIC(18,2) NOT NULL DEFAULT 0,
  "payment_status" TEXT
);

CREATE TABLE IF NOT EXISTS "materials" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "materials_slug_key" ON "materials"("slug");

CREATE TABLE IF NOT EXISTS "live_sessions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "scheduled_at" TIMESTAMPTZ
);
