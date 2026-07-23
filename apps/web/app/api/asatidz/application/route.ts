import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getAsatidzAccount } from '@/lib/auth/asatidz-access'
import { db } from '@/lib/db'
import { checkRateLimit, requestIdentity } from '@/lib/security/rate-limit'
import { createClient } from '@/lib/supabase/server'

const applicationSchema = z.object({
  nama: z.string().trim().min(2).max(120),
  noWa: z.string().trim().regex(/^\+?[0-9][0-9 -]{7,18}$/),
  title: z.string().trim().max(80).optional(),
  bidang: z.string().trim().max(160).optional(),
  bio: z.string().trim().max(2_000).optional(),
  formalEducation: z.string().trim().min(3).max(3_000),
  nonformalEducation: z.string().trim().max(3_000).optional(),
  teachingExperience: z.string().trim().min(3).max(4_000),
  memorizationJuz: z.coerce.number().min(0).max(30),
  sanadHistory: z.string().trim().max(3_000).optional(),
  teachingArea: z.string().trim().max(500).optional(),
  bank: z.string().trim().min(2).max(100),
  bankAccountType: z.string().trim().min(2).max(80),
  bankAccountName: z.string().trim().min(2).max(160),
  bankAccountNumber: z.string().trim().regex(/^[0-9]{5,30}$/),
  expertiseTagIds: z.array(z.uuid()).min(1).max(12),
})

const documentSchema = z.object({
  documentType: z.enum(['cv', 'certificate', 'sanad', 'identity', 'other']),
  storagePath: z.string().trim().min(8).max(500),
  mimeType: z.enum(['application/pdf', 'image/jpeg', 'image/png']),
  sizeBytes: z.number().int().positive().max(10 * 1024 * 1024),
})

function cleanOptional(value?: string) {
  const result = value?.trim()
  return result ? result : null
}

export async function GET() {
  const account = await getAsatidzAccount()
  if (!account) return NextResponse.json({ error: 'Akun Asatidz tidak ditemukan.' }, { status: 403 })

  const [profile, tags, documents] = await Promise.all([
    db.profile.findUnique({
      where: { id: account.user.id },
      include: {
        asatidzProfile: {
          include: {
            expertise: { select: { tagId: true } },
          },
        },
      },
    }),
    db.expertiseTag.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, description: true },
    }),
    db.asatidzDocument.findMany({
      where: { asatidzId: account.user.id },
      orderBy: { uploadedAt: 'desc' },
      select: {
        id: true,
        documentType: true,
        storagePath: true,
        mimeType: true,
        sizeBytes: true,
        status: true,
        uploadedAt: true,
      },
    }),
  ])

  if (!profile) return NextResponse.json({ error: 'Profil tidak ditemukan.' }, { status: 404 })

  const detail = profile.asatidzProfile
  return NextResponse.json({
    application: {
      id: profile.id,
      nama: profile.nama,
      email: profile.email,
      noWa: profile.noWa,
      title: detail?.title ?? '',
      bidang: detail?.bidang ?? '',
      bio: detail?.bio ?? '',
      formalEducation: detail?.formalEducation ?? '',
      nonformalEducation: detail?.nonformalEducation ?? '',
      teachingExperience: detail?.pengalamanMengajar ?? '',
      memorizationJuz: detail?.memorizationJuz ? Number(detail.memorizationJuz) : 0,
      sanadHistory: detail?.sanadHistory ?? '',
      teachingArea: detail?.teachingArea ?? '',
      bank: detail?.bank ?? '',
      bankAccountType: detail?.bankAccountType ?? '',
      bankAccountName: detail?.bankAccountName ?? '',
      bankAccountNumber: detail?.noRekening ?? '',
      expertiseTagIds: detail?.expertise.map((item) => item.tagId) ?? [],
      status: detail?.status ?? 'PENDING_PROFILE',
      approved: detail?.approved ?? false,
      asatidzCode: detail?.asatidzCode ?? null,
      reviewNote: detail?.reviewNote ?? null,
      submittedAt: detail?.submittedAt?.toISOString() ?? null,
    },
    tags,
    documents: documents.map((document) => ({
      ...document,
      sizeBytes: Number(document.sizeBytes),
      uploadedAt: document.uploadedAt.toISOString(),
    })),
  })
}

export async function PATCH(request: Request) {
  const account = await getAsatidzAccount()
  if (!account) return NextResponse.json({ error: 'Akun Asatidz tidak ditemukan.' }, { status: 403 })

  const rate = checkRateLimit(
    `asatidz-application:${requestIdentity(request, account.user.id)}`,
    20,
    60 * 60 * 1_000,
  )
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Terlalu banyak perubahan profil. Silakan coba lagi nanti.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } },
    )
  }

  if (!['PENDING_PROFILE', 'REVISION_REQUIRED', 'REJECTED'].includes(account.access.status)) {
    return NextResponse.json(
      { error: 'Data tidak dapat diubah selama proses review atau setelah disetujui.' },
      { status: 409 },
    )
  }

  const parsed = applicationSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Data belum lengkap atau formatnya tidak valid.', fields: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const data = parsed.data
  const validTagCount = await db.expertiseTag.count({
    where: { id: { in: data.expertiseTagIds }, isActive: true },
  })
  if (validTagCount !== data.expertiseTagIds.length) {
    return NextResponse.json({ error: 'Ada tag keilmuan yang tidak tersedia.' }, { status: 400 })
  }

  await db.$transaction(async (tx) => {
    await tx.profile.update({
      where: { id: account.user.id },
      data: { nama: data.nama, noWa: data.noWa },
    })

    await tx.asatidzProfile.upsert({
      where: { id: account.user.id },
      create: {
        id: account.user.id,
        approved: false,
        status: 'PENDING_PROFILE',
        title: cleanOptional(data.title),
        bidang: cleanOptional(data.bidang),
        bio: cleanOptional(data.bio),
        formalEducation: data.formalEducation,
        nonformalEducation: cleanOptional(data.nonformalEducation),
        pengalamanMengajar: data.teachingExperience,
        memorizationJuz: data.memorizationJuz,
        sanadHistory: cleanOptional(data.sanadHistory),
        teachingArea: cleanOptional(data.teachingArea),
        bank: data.bank,
        bankAccountType: data.bankAccountType,
        bankAccountName: data.bankAccountName,
        noRekening: data.bankAccountNumber,
      },
      update: {
        title: cleanOptional(data.title),
        bidang: cleanOptional(data.bidang),
        bio: cleanOptional(data.bio),
        formalEducation: data.formalEducation,
        nonformalEducation: cleanOptional(data.nonformalEducation),
        pengalamanMengajar: data.teachingExperience,
        memorizationJuz: data.memorizationJuz,
        sanadHistory: cleanOptional(data.sanadHistory),
        teachingArea: cleanOptional(data.teachingArea),
        bank: data.bank,
        bankAccountType: data.bankAccountType,
        bankAccountName: data.bankAccountName,
        noRekening: data.bankAccountNumber,
      },
    })

    await tx.asatidzExpertise.deleteMany({ where: { asatidzId: account.user.id } })
    await tx.asatidzExpertise.createMany({
      data: data.expertiseTagIds.map((tagId) => ({ asatidzId: account.user.id, tagId })),
      skipDuplicates: true,
    })
  })

  return NextResponse.json({ success: true })
}

export async function POST() {
  const account = await getAsatidzAccount()
  if (!account) return NextResponse.json({ error: 'Akun Asatidz tidak ditemukan.' }, { status: 403 })
  if (!['PENDING_PROFILE', 'REVISION_REQUIRED', 'REJECTED'].includes(account.access.status)) {
    return NextResponse.json({ error: 'Pendaftaran sudah dikirim atau telah selesai ditinjau.' }, { status: 409 })
  }

  const application = await db.asatidzProfile.findUnique({
    where: { id: account.user.id },
    include: {
      profile: { select: { nama: true, email: true, noWa: true, isActive: true } },
      expertise: { select: { tagId: true } },
      documents: { where: { documentType: 'cv' }, select: { id: true } },
    },
  })
  const complete = Boolean(
    application?.profile.isActive
      && application.profile.nama.trim()
      && application.profile.email.trim()
      && application.profile.noWa?.trim()
      && application.bank?.trim()
      && application.noRekening?.trim()
      && application.bankAccountName?.trim()
      && application.formalEducation?.trim()
      && application.pengalamanMengajar?.trim()
      && application.memorizationJuz !== null
      && application.expertise.length > 0
      && application.documents.length > 0,
  )
  if (!complete) {
    return NextResponse.json({ error: 'Lengkapi seluruh data wajib, pilih keilmuan, dan unggah CV sebelum mengirim.' }, { status: 400 })
  }

  const submittedAt = new Date()
  await db.$transaction([
    db.asatidzProfile.update({
      where: { id: account.user.id },
      data: {
        status: 'PENDING_REVIEW',
        approved: false,
        reviewNote: null,
        submittedAt,
        reviewedBy: null,
        reviewedAt: null,
      },
    }),
    db.activityLog.create({
      data: {
        type: 'asatidz_application',
        title: 'Pendaftaran Asatidz Dikirim',
        description: `${application!.profile.nama} mengirim pendaftaran untuk ditinjau.`,
        userId: account.user.id,
        relatedId: account.user.id,
        relatedTable: 'asatidz_profiles',
        status: 'warning',
      },
    }),
  ])
  return NextResponse.json({ success: true, application: { status: 'PENDING_REVIEW', submittedAt: submittedAt.toISOString() } })
}

export async function PUT(request: Request) {
  const account = await getAsatidzAccount()
  if (!account) return NextResponse.json({ error: 'Akun Asatidz tidak ditemukan.' }, { status: 403 })
  if (!['PENDING_PROFILE', 'REVISION_REQUIRED', 'REJECTED'].includes(account.access.status)) {
    return NextResponse.json({ error: 'Dokumen tidak dapat diubah pada status ini.' }, { status: 409 })
  }

  const parsed = documentSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Metadata dokumen tidak valid.' }, { status: 400 })

  const expectedPrefix = `${account.user.id}/`
  if (!parsed.data.storagePath.startsWith(expectedPrefix)) {
    return NextResponse.json({ error: 'Lokasi dokumen tidak valid.' }, { status: 400 })
  }

  const document = await db.asatidzDocument.create({
    data: {
      asatidzId: account.user.id,
      documentType: parsed.data.documentType,
      storagePath: parsed.data.storagePath,
      mimeType: parsed.data.mimeType,
      sizeBytes: BigInt(parsed.data.sizeBytes),
      status: 'pending',
    },
    select: { id: true },
  })

  return NextResponse.json({ success: true, id: document.id }, { status: 201 })
}

export async function DELETE(request: Request) {
  const account = await getAsatidzAccount()
  if (!account) return NextResponse.json({ error: 'Akun Asatidz tidak ditemukan.' }, { status: 403 })
  if (!['PENDING_PROFILE', 'REVISION_REQUIRED', 'REJECTED'].includes(account.access.status)) {
    return NextResponse.json({ error: 'Dokumen tidak dapat dihapus pada status ini.' }, { status: 409 })
  }

  const id = new URL(request.url).searchParams.get('id')
  if (!id || !z.uuid().safeParse(id).success) {
    return NextResponse.json({ error: 'Dokumen tidak valid.' }, { status: 400 })
  }

  const document = await db.asatidzDocument.findFirst({
    where: { id, asatidzId: account.user.id },
    select: { id: true, storagePath: true },
  })
  if (!document) return NextResponse.json({ error: 'Dokumen tidak ditemukan.' }, { status: 404 })

  const supabase = await createClient()
  const { error: storageError } = await supabase.storage.from('asatidz-private').remove([document.storagePath])
  if (storageError) return NextResponse.json({ error: storageError.message }, { status: 502 })

  await db.asatidzDocument.delete({ where: { id: document.id } })
  return NextResponse.json({ success: true })
}
