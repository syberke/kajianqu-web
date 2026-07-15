-- Expand the ORM baseline using columns and relations already consumed by the existing application.
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "no_wa" TEXT;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "bank" TEXT;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "no_rekening" TEXT;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS "asatidz_profiles" (
  "id" UUID PRIMARY KEY,
  "bidang" TEXT,
  "latar_belakang" TEXT,
  "approved" BOOLEAN NOT NULL DEFAULT FALSE,
  "cv_url" TEXT,
  "sertifikat" TEXT,
  "keahlian" TEXT,
  "pengalaman_mengajar" TEXT,
  "bio" TEXT
);
CREATE INDEX IF NOT EXISTS "asatidz_profiles_approved_idx" ON "asatidz_profiles"("approved");

ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "message" TEXT;
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "recipient_id" UUID;
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "action_url" TEXT;
CREATE INDEX IF NOT EXISTS "notifications_recipient_id_created_at_idx" ON "notifications"("recipient_id", "created_at");

ALTER TABLE "activity_logs" ADD COLUMN IF NOT EXISTS "user_id" UUID;
ALTER TABLE "activity_logs" ADD COLUMN IF NOT EXISTS "related_id" UUID;
ALTER TABLE "activity_logs" ADD COLUMN IF NOT EXISTS "related_table" TEXT;
CREATE INDEX IF NOT EXISTS "activity_logs_type_created_at_idx" ON "activity_logs"("type", "created_at");

CREATE TABLE IF NOT EXISTS "donation_methods" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "method_type" TEXT NOT NULL,
  "bank_name" TEXT,
  "account_number" TEXT,
  "account_name" TEXT,
  "qris_image_url" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "donation_methods_is_active_created_at_idx" ON "donation_methods"("is_active", "created_at");

ALTER TABLE "donations" ADD COLUMN IF NOT EXISTS "user_id" UUID;
ALTER TABLE "donations" ADD COLUMN IF NOT EXISTS "category" TEXT;
ALTER TABLE "donations" ADD COLUMN IF NOT EXISTS "method_id" UUID;
ALTER TABLE "donations" ADD COLUMN IF NOT EXISTS "note" TEXT;
ALTER TABLE "donations" ADD COLUMN IF NOT EXISTS "payment_proof_url" TEXT;
ALTER TABLE "donations" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "donations" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
CREATE INDEX IF NOT EXISTS "donations_payment_status_created_at_idx" ON "donations"("payment_status", "created_at");
CREATE INDEX IF NOT EXISTS "donations_user_id_created_at_idx" ON "donations"("user_id", "created_at");

CREATE TABLE IF NOT EXISTS "donation_products" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "price" NUMERIC(18,2) NOT NULL DEFAULT 0,
  "image" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "donation_products_is_active_created_at_idx" ON "donation_products"("is_active", "created_at");

ALTER TABLE "keilmuan" ADD COLUMN IF NOT EXISTS "deskripsi" TEXT;
ALTER TABLE "keilmuan" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN NOT NULL DEFAULT TRUE;
CREATE INDEX IF NOT EXISTS "keilmuan_is_active_idx" ON "keilmuan"("is_active");

ALTER TABLE "materials" ADD COLUMN IF NOT EXISTS "thumbnail_url" TEXT;
ALTER TABLE "materials" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS "private_class_enrollments" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "material_id" UUID NOT NULL,
  "student_id" UUID NOT NULL,
  "status" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "private_class_enrollments_material_id_created_at_idx" ON "private_class_enrollments"("material_id", "created_at");
CREATE INDEX IF NOT EXISTS "private_class_enrollments_student_id_created_at_idx" ON "private_class_enrollments"("student_id", "created_at");

CREATE TABLE IF NOT EXISTS "private_class_pages" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "asatidz_id" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "zoom_link" TEXT NOT NULL,
  "passcode" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "private_class_pages_asatidz_id_created_at_idx" ON "private_class_pages"("asatidz_id", "created_at");
CREATE INDEX IF NOT EXISTS "private_class_pages_is_active_created_at_idx" ON "private_class_pages"("is_active", "created_at");

CREATE TABLE IF NOT EXISTS "messages" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "sender_id" UUID NOT NULL,
  "receiver_id" UUID NOT NULL,
  "content" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "messages_receiver_id_created_at_idx" ON "messages"("receiver_id", "created_at");
CREATE INDEX IF NOT EXISTS "messages_sender_id_created_at_idx" ON "messages"("sender_id", "created_at");
