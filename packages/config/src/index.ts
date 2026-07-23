export const appConfig = {
  quranApiBaseUrl: process.env.EXPO_PUBLIC_QURAN_API_BASE_URL || 'https://api.quran.com/api/v4',
  quranTranslationId: Number(process.env.EXPO_PUBLIC_QURAN_TRANSLATION_ID || 134),
  quranRecitationId: Number(process.env.EXPO_PUBLIC_QURAN_RECITATION_ID || 7),
  maxQuranRecordingSeconds: 180,
} as const
