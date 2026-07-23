import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getAuthenticatedUser } from '@/lib/auth/require-admin'
import { db } from '@/lib/db'
import { checkRateLimit, requestIdentity } from '@/lib/security/rate-limit'

export async function GET() {
  const topics = await db.muamalatTopic.findMany({
    where: { status: { not: 'hidden' } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  const topicIds = topics.map((topic) => topic.id)
  const answers = topicIds.length
    ? await db.muamalatAnswer.findMany({ where: { topicId: { in: topicIds } }, orderBy: { createdAt: 'asc' } })
    : []
  const authorIds = [...new Set([
    ...topics.map((topic) => topic.authorId),
    ...answers.map((answer) => answer.authorId),
  ])]
  const authors = authorIds.length
    ? await db.profile.findMany({ where: { id: { in: authorIds } }, select: { id: true, nama: true, role: true } })
    : []
  const authorMap = new Map(authors.map((author) => [author.id, author]))

  return NextResponse.json({
    topics: topics.map((topic) => ({
      id: topic.id,
      title: topic.title,
      content: topic.content,
      category: topic.category,
      status: topic.status,
      createdAt: topic.createdAt.toISOString(),
      author: {
        name: authorMap.get(topic.authorId)?.nama ?? 'Sahabat KajianQu',
        role: authorMap.get(topic.authorId)?.role ?? 'siswa',
      },
      answers: answers.filter((answer) => answer.topicId === topic.id).map((answer) => ({
        id: answer.id,
        content: answer.content,
        isOfficial: answer.isOfficial,
        createdAt: answer.createdAt.toISOString(),
        author: {
          name: authorMap.get(answer.authorId)?.nama ?? 'Sahabat KajianQu',
          role: authorMap.get(answer.authorId)?.role ?? 'siswa',
        },
      })),
    })),
  })
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Silakan masuk untuk mengirim pertanyaan.' }, { status: 401 })
  const profile = await db.profile.findUnique({
    where: { id: user.id },
    include: { asatidzProfile: { select: { approved: true, status: true } } },
  })
  if (!profile?.isActive) return NextResponse.json({ error: 'Akun tidak aktif.' }, { status: 403 })

  const rate = checkRateLimit(`muamalat:${requestIdentity(request, user.id)}`, 10, 60 * 60 * 1_000)
  if (!rate.allowed) return NextResponse.json({ error: 'Terlalu banyak kiriman. Silakan coba lagi nanti.' }, { status: 429 })

  const parsed = z.discriminatedUnion('kind', [
    z.object({
      kind: z.literal('topic'),
      title: z.string().trim().min(5).max(180),
      content: z.string().trim().min(10).max(4_000),
      category: z.string().trim().max(80).optional(),
    }),
    z.object({
      kind: z.literal('answer'),
      topicId: z.uuid(),
      content: z.string().trim().min(5).max(4_000),
    }),
  ]).safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Isi pertanyaan atau jawaban belum valid.' }, { status: 400 })

  if (parsed.data.kind === 'topic') {
    const topic = await db.muamalatTopic.create({
      data: {
        authorId: user.id,
        title: parsed.data.title,
        content: parsed.data.content,
        category: parsed.data.category?.trim() || null,
        status: 'open',
      },
    })
    return NextResponse.json({ id: topic.id }, { status: 201 })
  }

  const topic = await db.muamalatTopic.findFirst({ where: { id: parsed.data.topicId, status: { not: 'hidden' } }, select: { id: true } })
  if (!topic) return NextResponse.json({ error: 'Topik tidak ditemukan.' }, { status: 404 })
  const official = profile.role === 'asatidz'
    && profile.asatidzProfile?.approved === true
    && profile.asatidzProfile.status === 'APPROVED'
  const answer = await db.muamalatAnswer.create({
    data: {
      topicId: topic.id,
      authorId: user.id,
      content: parsed.data.content,
      isOfficial: official,
    },
  })
  return NextResponse.json({ id: answer.id, isOfficial: answer.isOfficial }, { status: 201 })
}
