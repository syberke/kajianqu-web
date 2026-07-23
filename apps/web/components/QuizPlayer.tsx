"use client";

import { useState } from "react";

type Question = {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
};

type Props = {
  questions: Question[];
};

export default function QuizPlayer({ questions }: Props) {

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  function selectAnswer(qid: string, answer: string) {
    setAnswers({
      ...answers,
      [qid]: answer
    });
  }

  function submitQuiz() {
    setSubmitted(true);
  }

  function calculateScore() {
    let score = 0;

    questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) {
        score++;
      }
    });

    return score;
  }

  const score = calculateScore();

  return (
    <div className="space-y-6">

      {questions.map((q, index) => (
        <div key={q.id} className="border p-4 rounded-lg">

          <h3 className="font-semibold mb-3">
            {index + 1}. {q.question}
          </h3>

          <div className="space-y-2">

           {[
  { key: "A", text: q.option_a },
  { key: "B", text: q.option_b },
  { key: "C", text: q.option_c },
  { key: "D", text: q.option_d },
].map((opt) => (

  <label key={opt.key} className="block cursor-pointer">

    <input
      type="radio"
      name={q.id}
      value={opt.key}
      disabled={submitted}
      checked={answers[q.id] === opt.key}
      onChange={() => selectAnswer(q.id, opt.key)}
    />

    <span className="ml-2">
      {opt.key}. {opt.text}
    </span>

  </label>

))}
          </div>

          {submitted && (
            <div className="mt-2 text-sm">
              {answers[q.id] === q.correct_answer
                ? "✅ Benar"
                : `❌ Salah. Jawaban benar: ${q.correct_answer}`}
            </div>
          )}

        </div>
      ))}

      {!submitted && (
        <button
          onClick={submitQuiz}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Submit Quiz
        </button>
      )}

      {submitted && (
        <div className="text-lg font-bold">
          Skor: {score} / {questions.length}
        </div>
      )}

    </div>
  );
}