import { z } from 'zod'

export const asatidzMaterialSchema = z.object({
  title: z.string().trim().min(3).max(160),
  summary: z.string().trim().max(500).optional(),
  description: z.string().trim().max(20_000).optional(),
  youtubeUrl: z.union([z.url().max(500), z.literal('')]).optional(),
  durationMinutes: z.coerce.number().int().min(30).max(720).optional(),
  referencesText: z.string().trim().max(4_000).optional(),
  type: z.enum(['materi', 'kajian_tematik']).default('materi'),
  keilmuanId: z.union([z.uuid(), z.literal('')]).optional(),
  submitForReview: z.boolean().default(false),
}).superRefine((value, context) => {
  if (!value.youtubeUrl && !value.description?.trim()) {
    context.addIssue({ code: 'custom', path: ['description'], message: 'Sertakan video atau materi teks.' })
  }
  if (value.youtubeUrl && !/(youtube\.com|youtu\.be)/i.test(value.youtubeUrl)) {
    context.addIssue({ code: 'custom', path: ['youtubeUrl'], message: 'Gunakan tautan YouTube.' })
  }
  if (value.youtubeUrl && !value.durationMinutes) {
    context.addIssue({ code: 'custom', path: ['durationMinutes'], message: 'Durasi video wajib diisi.' })
  }
})

export function materialSlug(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}
