import { notFound } from 'next/navigation'

import { db } from '@/lib/db'
import MateriDetailClient from './MateriDeltailClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function MateriDetailPage({ params }: Props) {
  const { id } = await params
  const material = await db.material.findFirst({
    where: { id, isPublished: true, reviewStatus: 'approved' },
    include: {
      keilmuan: { select: { id: true, nama: true } },
      asatidz: { select: { nama: true, fotoUrl: true } },
      quizzes: {
        where: { isActive: true },
        include: {
          questions: { orderBy: { orderNo: 'asc' } },
        },
      },
    },
  })

  if (!material) notFound()

  const item = {
    id: material.id,
    title: material.title,
    description: material.description ?? material.summary,
    youtube_url: material.youtubeUrl,
    level: material.level,
    keilmuan: material.keilmuan,
    asatidz: material.asatidz
      ? { nama: material.asatidz.nama, foto_url: material.asatidz.fotoUrl }
      : null,
    quizzes: material.quizzes.map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      quiz_questions: quiz.questions.map((question) => ({
        id: question.id,
        question: question.question,
        option_a: question.optionA,
        option_b: question.optionB,
        option_c: question.optionC,
        option_d: question.optionD,
        correct_answer: question.correctAnswer,
        explanation: question.explanation,
        order_no: question.orderNo,
      })),
    })),
  }

  return <MateriDetailClient materi={item} />
}
