import { NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAsatidz } from '@/lib/auth/require-asatidz'
import { db } from '@/lib/db'

const privateClassSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(10).max(4_000),
  capacity: z.coerce.number().int().min(1).max(500),
  price: z.coerce.number().min(0).max(100_000_000),
  startsAt: z.iso.datetime(),
  endsAt: z.iso.datetime(),
  sessionTitle: z.string().trim().min(3).max(160),
  durationMinutes: z.coerce.number().int().min(30).max(480),
  zoomLink: z.url().max(500),
  meetingId: z.string().trim().min(3).max(80),
  passcode: z.string().trim().min(4).max(40),
  rules: z.string().trim().max(4_000).optional(),
})

const enrollmentSchema = z.object({
  classId: z.uuid(),
  userId: z.uuid(),
  status: z.enum(['active', 'rejected']),
})

export async function GET() {
  const user = await requireAsatidz()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const classes = await db.privateClass.findMany({
    where: { asatidzId: user.id },
    orderBy: { createdAt: 'desc' },
  })
  const classIds = classes.map((item) => item.id)
  const [members, sessions, rooms] = await Promise.all([
    classIds.length
      ? db.classMember.findMany({ where: { classId: { in: classIds } }, orderBy: { createdAt: 'desc' } })
      : [],
    classIds.length
      ? db.classSession.findMany({ where: { classId: { in: classIds } }, orderBy: { startsAt: 'asc' } })
      : [],
    classIds.length
      ? db.chatRoom.findMany({ where: { classId: { in: classIds }, roomType: 'class' } })
      : [],
  ])
  const userIds = [...new Set(members.map((member) => member.userId))]
  const students = userIds.length
    ? await db.profile.findMany({ where: { id: { in: userIds } }, select: { id: true, nama: true } })
    : []
  const studentMap = new Map(students.map((student) => [student.id, student]))

  return NextResponse.json({
    classes: classes.map((item) => {
      const itemSessions = sessions.filter((session) => session.classId === item.id)
      const nextSession = itemSessions.find((session) => session.startsAt >= new Date()) ?? itemSessions[0] ?? null
      return {
        id: item.id,
        title: item.title,
        description: item.description,
        capacity: item.capacity,
        price: Number(item.price),
        startsAt: item.startsAt?.toISOString() ?? null,
        endsAt: item.endsAt?.toISOString() ?? null,
        registrationStatus: item.registrationStatus,
        rules: item.rules,
        createdAt: item.createdAt.toISOString(),
        roomId: rooms.find((room) => room.classId === item.id)?.id ?? null,
        session: nextSession
          ? {
              id: nextSession.id,
              title: nextSession.title,
              startsAt: nextSession.startsAt.toISOString(),
              durationMinutes: nextSession.durationMinutes,
              zoomLink: nextSession.meetingUrl,
              meetingId: nextSession.meetingId,
              passcode: nextSession.passcode,
            }
          : null,
        enrollments: members.filter((member) => member.classId === item.id).map((member) => ({
          classId: member.classId,
          userId: member.userId,
          status: member.status,
          studentName: studentMap.get(member.userId)?.nama ?? 'Siswa KajianQu',
          joinedAt: member.joinedAt?.toISOString() ?? null,
        })),
      }
    }),
  })
}

export async function POST(request: Request) {
  const user = await requireAsatidz()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = privateClassSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Data kelas, jadwal, dan Zoom belum lengkap atau tidak valid.', fields: parsed.error.flatten().fieldErrors }, { status: 400 })
  }
  const data = parsed.data
  const startsAt = new Date(data.startsAt)
  const endsAt = new Date(data.endsAt)
  if (endsAt <= startsAt) return NextResponse.json({ error: 'Waktu selesai harus setelah waktu mulai.' }, { status: 400 })

  const item = await db.$transaction(async (tx) => {
    const created = await tx.privateClass.create({
      data: {
        asatidzId: user.id,
        title: data.title,
        description: data.description,
        capacity: data.capacity,
        price: data.price,
        startsAt,
        endsAt,
        registrationStatus: 'open',
        rules: data.rules?.trim() || null,
      },
    })
    await tx.classSession.create({
      data: {
        classId: created.id,
        title: data.sessionTitle,
        startsAt,
        durationMinutes: data.durationMinutes,
        meetingUrl: data.zoomLink,
        meetingId: data.meetingId,
        passcode: data.passcode,
      },
    })
    const room = await tx.chatRoom.create({
      data: {
        roomType: 'class',
        classId: created.id,
        title: created.title,
        createdBy: user.id,
      },
    })
    await tx.chatRoomMember.create({
      data: { roomId: room.id, userId: user.id, memberRole: 'owner' },
    })
    return { created, roomId: room.id }
  })

  return NextResponse.json({
    class: {
      id: item.created.id,
      title: item.created.title,
      roomId: item.roomId,
      registrationStatus: item.created.registrationStatus,
    },
  }, { status: 201 })
}

export async function PATCH(request: Request) {
  const user = await requireAsatidz()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = enrollmentSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Data persetujuan tidak valid.' }, { status: 400 })

  const privateClass = await db.privateClass.findFirst({
    where: { id: parsed.data.classId, asatidzId: user.id },
    select: { id: true },
  })
  if (!privateClass) return NextResponse.json({ error: 'Kelas tidak ditemukan.' }, { status: 404 })

  const room = await db.chatRoom.findFirst({
    where: { classId: privateClass.id, roomType: 'class' },
    select: { id: true },
  })
  const updated = await db.$transaction(async (tx) => {
    const member = await tx.classMember.update({
      where: { classId_userId: { classId: privateClass.id, userId: parsed.data.userId } },
      data: {
        status: parsed.data.status,
        joinedAt: parsed.data.status === 'active' ? new Date() : null,
      },
    })
    if (room && parsed.data.status === 'active') {
      await tx.chatRoomMember.upsert({
        where: { roomId_userId: { roomId: room.id, userId: parsed.data.userId } },
        create: { roomId: room.id, userId: parsed.data.userId, memberRole: 'member' },
        update: { blockedAt: null },
      })
    }
    if (room && parsed.data.status === 'rejected') {
      await tx.chatRoomMember.deleteMany({ where: { roomId: room.id, userId: parsed.data.userId } })
    }
    return member
  })

  return NextResponse.json({ classId: updated.classId, userId: updated.userId, status: updated.status })
}
