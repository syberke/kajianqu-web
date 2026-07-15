-- Quiz tables already implied by the existing nested Supabase material query.
CREATE TABLE IF NOT EXISTS "quizzes" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "material_id" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT
);

CREATE TABLE IF NOT EXISTS "quiz_questions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "quiz_id" UUID NOT NULL,
  "question" TEXT NOT NULL,
  "option_a" TEXT NOT NULL,
  "option_b" TEXT NOT NULL,
  "option_c" TEXT NOT NULL,
  "option_d" TEXT NOT NULL,
  "correct_answer" TEXT NOT NULL,
  "explanation" TEXT,
  "order_no" INTEGER
);

CREATE INDEX IF NOT EXISTS "quizzes_material_id_idx" ON "quizzes"("material_id");
CREATE INDEX IF NOT EXISTS "quiz_questions_quiz_id_order_no_idx" ON "quiz_questions"("quiz_id", "order_no");
