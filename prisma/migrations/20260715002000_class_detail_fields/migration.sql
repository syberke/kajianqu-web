-- Material and live-session fields already consumed by the public class pages.
ALTER TABLE "materials" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "materials" ADD COLUMN IF NOT EXISTS "youtube_url" TEXT;
ALTER TABLE "materials" ADD COLUMN IF NOT EXISTS "level" TEXT;

ALTER TABLE "live_sessions" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "live_sessions" ADD COLUMN IF NOT EXISTS "youtube_url" TEXT;
ALTER TABLE "live_sessions" ADD COLUMN IF NOT EXISTS "stream_url" TEXT;
ALTER TABLE "live_sessions" ADD COLUMN IF NOT EXISTS "status" TEXT;
ALTER TABLE "live_sessions" ADD COLUMN IF NOT EXISTS "asatidz_id" UUID;

CREATE INDEX IF NOT EXISTS "live_sessions_asatidz_id_idx" ON "live_sessions"("asatidz_id");
CREATE INDEX IF NOT EXISTS "live_sessions_status_scheduled_at_idx" ON "live_sessions"("status", "scheduled_at");
