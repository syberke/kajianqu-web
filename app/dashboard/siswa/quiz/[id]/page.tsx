import { createClient } from "../../../../../lib/supabase/server";
import QuizPlayer from "../../../../../components/QuizPlayer";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const { id } = await params; // unwrap params

  const supabase = await createClient();

  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", id);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <QuizPlayer questions={questions ?? []} />
    </div>
  );
}