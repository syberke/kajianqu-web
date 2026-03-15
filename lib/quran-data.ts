// lib/quran-data.ts
import { QuranSurah } from '@/types/quran'

export const QURAN_SURAHS: Record<number, QuranSurah> = {
  1: {
    id: 1,
    name: 'Al-Fatihah',
    nameArabic: 'الفاتحة',
    totalAyat: 7,
    ayat: [
      {
        number: 1,
        arabic: ['بِسْمِ', 'اللَّهِ', 'الرَّحْمَٰنِ', 'الرَّحِيمِ'],
        latin: 'Bismillaahir Rahmaanir Rahiim',
        translation: 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang',
      },
      {
        number: 2,
        arabic: ['الْحَمْدُ', 'لِلَّهِ', 'رَبِّ', 'الْعَالَمِينَ'],
        latin: 'Alhamdu lillaahi Rabbil aalamiin',
        translation: 'Segala puji bagi Allah, Tuhan seluruh alam',
      },
      {
        number: 3,
        arabic: ['الرَّحْمَٰنِ', 'الرَّحِيمِ'],
        latin: 'Ar-Rahmaanir-Rahiim',
        translation: 'Yang Maha Pengasih, Maha Penyayang',
      },
      {
        number: 4,
        arabic: ['مَالِكِ', 'يَوْمِ', 'الدِّينِ'],
        latin: 'Maaliki Yawmid-Diin',
        translation: 'Pemilik hari pembalasan',
      },
      {
        number: 5,
        arabic: ['إِيَّاكَ', 'نَعْبُدُ', 'وَإِيَّاكَ', 'نَسْتَعِينُ'],
        latin: 'Iyyaaka nabudu wa iyyaaka nastaiin',
        translation: 'Hanya kepada Engkaulah kami menyembah dan memohon pertolongan',
      },
      {
        number: 6,
        arabic: ['اهْدِنَا', 'الصِّرَاطَ', 'الْمُسْتَقِيمَ'],
        latin: 'Ihdinas-Siraatal-Mustaqiim',
        translation: 'Tunjukilah kami jalan yang lurus',
      },
      {
        number: 7,
        arabic: ['صِرَاطَ', 'الَّذِينَ', 'أَنْعَمْتَ', 'عَلَيْهِمْ', 'غَيْرِ', 'الْمَغْضُوبِ', 'عَلَيْهِمْ', 'وَلَا', 'الضَّالِّينَ'],
        latin: 'Siraatal-ladziina anamta alaihim ghairil-maghduubi alaihim waladh-dhaalliin',
        translation: 'Yaitu jalan orang-orang yang telah Engkau beri nikmat',
      },
    ],
  },
  112: {
    id: 112,
    name: 'Al-Ikhlas',
    nameArabic: 'الإخلاص',
    totalAyat: 4,
    ayat: [
      {
        number: 1,
        arabic: ['قُلْ', 'هُوَ', 'اللَّهُ', 'أَحَدٌ'],
        latin: 'Qul huwallahu ahad',
        translation: 'Katakanlah: Dialah Allah, Yang Maha Esa',
      },
      {
        number: 2,
        arabic: ['اللَّهُ', 'الصَّمَدُ'],
        latin: 'Allaahush-shamad',
        translation: 'Allah tempat meminta segala sesuatu',
      },
      {
        number: 3,
        arabic: ['لَمْ', 'يَلِدْ', 'وَلَمْ', 'يُولَدْ'],
        latin: 'Lam yalid wa lam yuulad',
        translation: 'Dia tidak beranak dan tidak pula diperanakkan',
      },
      {
        number: 4,
        arabic: ['وَلَمْ', 'يَكُن', 'لَّهُ', 'كُفُوًا', 'أَحَدٌ'],
        latin: 'Wa lam yakul lahuu kufuwan ahad',
        translation: 'Dan tidak ada sesuatu yang setara dengan Dia',
      },
    ],
  },
  113: {
    id: 113,
    name: 'Al-Falaq',
    nameArabic: 'الفلق',
    totalAyat: 5,
    ayat: [
      {
        number: 1,
        arabic: ['قُلْ', 'أَعُوذُ', 'بِرَبِّ', 'الْفَلَقِ'],
        latin: 'Qul auudzu birabbil-falaq',
        translation: 'Katakanlah: Aku berlindung kepada Tuhan yang menguasai subuh',
      },
      {
        number: 2,
        arabic: ['مِن', 'شَرِّ', 'مَا', 'خَلَقَ'],
        latin: 'Min syarri maa khalaq',
        translation: 'Dari kejahatan makhluk-Nya',
      },
      {
        number: 3,
        arabic: ['وَمِن', 'شَرِّ', 'غَاسِقٍ', 'إِذَا', 'وَقَبَ'],
        latin: 'Wa min syarri ghaasiqin izaa waqab',
        translation: 'Dan dari kejahatan malam apabila telah gelap gulita',
      },
      {
        number: 4,
        arabic: ['وَمِن', 'شَرِّ', 'النَّفَّاثَاتِ', 'فِي', 'الْعُقَدِ'],
        latin: 'Wa min syarrin-naffaatsaati fil-uqad',
        translation: 'Dan dari kejahatan penyihir yang meniup pada buhul-buhul',
      },
      {
        number: 5,
        arabic: ['وَمِن', 'شَرِّ', 'حَاسِدٍ', 'إِذَا', 'حَسَدَ'],
        latin: 'Wa min syarri haasidin izaa hasad',
        translation: 'Dan dari kejahatan orang yang dengki apabila ia dengki',
      },
    ],
  },
  114: {
    id: 114,
    name: 'An-Nas',
    nameArabic: 'الناس',
    totalAyat: 6,
    ayat: [
      {
        number: 1,
        arabic: ['قُلْ', 'أَعُوذُ', 'بِرَبِّ', 'النَّاسِ'],
        latin: 'Qul auudzu birabbin-naas',
        translation: 'Katakanlah: Aku berlindung kepada Tuhannya manusia',
      },
      {
        number: 2,
        arabic: ['مَلِكِ', 'النَّاسِ'],
        latin: 'Malikin-naas',
        translation: 'Raja manusia',
      },
      {
        number: 3,
        arabic: ['إِلَٰهِ', 'النَّاسِ'],
        latin: 'Ilaahin-naas',
        translation: 'Sembahan manusia',
      },
      {
        number: 4,
        arabic: ['مِن', 'شَرِّ', 'الْوَسْوَاسِ', 'الْخَنَّاسِ'],
        latin: 'Min syarril-waswaasil-khannaas',
        translation: 'Dari kejahatan bisikan setan yang bersembunyi',
      },
      {
        number: 5,
        arabic: ['الَّذِي', 'يُوَسْوِسُ', 'فِي', 'صُدُورِ', 'النَّاسِ'],
        latin: 'Alladzii yuwaswisu fii shuduurin-naas',
        translation: 'Yang membisikkan kejahatan ke dalam dada manusia',
      },
      {
        number: 6,
        arabic: ['مِنَ', 'الْجِنَّةِ', 'وَالنَّاسِ'],
        latin: 'Minal-jinnati wan-naas',
        translation: 'Dari golongan jin dan manusia',
      },
    ],
  },
}

export const SURAH_LIST = Object.values(QURAN_SURAHS).map(s => ({
  id: s.id,
  name: s.name,
  nameArabic: s.nameArabic,
  totalAyat: s.totalAyat,
}))

export function getSurah(id: number): QuranSurah | undefined {
  return QURAN_SURAHS[id]
}

export function getAudioUrl(surahId: number): string {
  return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${surahId}.mp3`
}

export function normalizeArabic(text: string): string {
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '') // hapus harakat
    .replace(/[أإآٱ]/g, 'ا')               // normalisasi alif
    .replace(/ة/g, 'ه')                     // ta marbuta → ha
    .replace(/ى/g, 'ي')                     // alif maqsura → ya
    .trim()
    .toLowerCase()
}

export function compareWord(expected: string, spoken: string): boolean {
  return normalizeArabic(expected) === normalizeArabic(spoken)
}

export function buildWordList(surahId: number, ayahStart: number, ayahEnd: number) {
  const surah = QURAN_SURAHS[surahId]
  if (!surah) return []

  const words: Array<{ arabic: string; ayahNumber: number; wordIndex: number }> = []

  for (let i = ayahStart - 1; i < Math.min(ayahEnd, surah.totalAyat); i++) {
    const ayah = surah.ayat[i]
    if (!ayah) continue
    ayah.arabic.forEach((word, idx) => {
      words.push({ arabic: word, ayahNumber: ayah.number, wordIndex: idx })
    })
  }

  return words
}