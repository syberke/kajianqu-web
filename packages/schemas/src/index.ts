import { z } from 'zod'

export const roleSchema = z.enum(['admin', 'siswa', 'asatidz'])
export type Role = z.infer<typeof roleSchema>

export const asatidzStatusSchema = z.enum([
  'PENDING_PROFILE',
  'PENDING_REVIEW',
  'REVISION_REQUIRED',
  'APPROVED',
  'REJECTED',
  'SUSPENDED',
])
export type AsatidzStatus = z.infer<typeof asatidzStatusSchema>

export const authSchema = z.object({
  email: z.email('Email tidak valid'),
  password: z.string().min(8, 'Kata sandi minimal 8 karakter'),
})

export const profileSchema = z.object({
  nama: z.string().trim().min(2).max(100),
  noWa: z.string().trim().regex(/^62\d{8,13}$/, 'Gunakan format 62xxxxxxxxxx'),
  role: roleSchema,
})

export const quranPracticeSchema = z
  .object({
    mode: z.enum(['murojaah', 'belajar']),
    surahNumber: z.number().int().min(1).max(114),
    ayahStart: z.number().int().min(1),
    ayahEnd: z.number().int().min(1),
  })
  .refine((value) => value.ayahEnd >= value.ayahStart, {
    message: 'Ayat akhir harus sama atau lebih besar dari ayat awal',
    path: ['ayahEnd'],
  })

export const materialSchema = z.object({
  title: z.string().trim().min(5).max(180),
  summary: z.string().trim().min(20).max(500),
  youtubeUrl: z.url().refine((value) => {
    const host = new URL(value).hostname.replace(/^www\./, '')
    return host === 'youtube.com' || host === 'youtu.be'
  }, 'Gunakan URL YouTube yang valid'),
})

export const donationSchema = z.object({
  programId: z.uuid(),
  amount: z.number().int().min(10_000).max(1_000_000_000),
  methodId: z.uuid(),
})

export const messageSchema = z.object({
  roomId: z.uuid(),
  content: z.string().trim().min(1).max(4000),
})
