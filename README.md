# KajianQu

KajianQu adalah aplikasi web pembelajaran Islam dan Al-Qur'an berbasis Next.js. Pengalaman AI Al-Qur'an terpusat di **`/quran-ai`** dan memiliki tepat dua mode aktif: **Murojaah** dan **Belajar Al-Qur'an**. Teks dan struktur ayat berasal dari Quran Foundation API, transkripsi audio memakai Gemini Live, dan data aplikasi yang dimigrasikan berjalan melalui Prisma.

## Stack utama

- Next.js 16, React 19, TypeScript, Tailwind CSS 4
- Supabase Auth dan Storage
- Prisma ORM + PostgreSQL
- Google Gemini Live API dan Gemini audio understanding
- Quran Foundation API (`api.quran.com/api/v4`)

## Quran AI

Route canonical:

- `/quran-ai` — hub pemilihan mode, surah, dan rentang ayat
- `/quran-ai/murojaah/[surahId]?start=&end=` — Murojaah
- `/quran-ai/belajar/[surahId]?start=&end=` — Belajar Al-Qur'an
- `/quran-ai/quiz` — Generate Quiz Al-Qur'an

Route Tahfidz, Tahsin, Ziyadah, dan `/quran` lama hanya dipertahankan sebagai redirect kompatibilitas ke route canonical di atas. Tahfidz diarahkan ke Murojaah. Tahsin dan Ziyadah diarahkan ke Belajar Al-Qur'an.

## Cara kerja Murojaah

1. Pengguna memilih surah serta ayat mulai dan selesai.
2. Server memuat teks dan word-level Al-Qur'an dari Quran Foundation API.
3. Server KajianQu membuat ephemeral token Gemini Live untuk pengguna yang sudah login.
4. Browser mengirim PCM 16 kHz ke Gemini Live selama mikrofon aktif.
5. Selama pengguna membaca, teks ayat, transkrip, dan warna koreksi disembunyikan.
6. Setelah pengguna menekan **Selesai membaca**, transkrip final disejajarkan dengan urutan kata canonical menggunakan sequence alignment.
7. Hasil benar, berbeda, dan terlewat baru ditampilkan setelah sesi selesai dan disimpan melalui API aplikasi ke Prisma.

Satu kata yang terlewat tidak dibandingkan hanya berdasarkan indeks array. Alignment final menangani substitution, omission, dan insertion agar kesalahan tidak menggeser seluruh kata berikutnya.

## Cara kerja Belajar Al-Qur'an

1. Pengguna memilih surah serta rentang ayat.
2. Quran Foundation API mengembalikan teks, word data, dan audio recitation ayah-by-ayah.
3. Pengguna wajib mendengarkan seluruh audio contoh pada rentang yang dipilih.
4. Setelah audio contoh selesai, tombol membaca aktif.
5. Selama membaca, Gemini Live menghasilkan input transcription dan browser juga menyimpan rekaman mikrofon penuh.
6. Setelah pengguna selesai, aplikasi menghitung alignment lafaz/urutan kata.
7. Rekaman audio penuh dikirim ke Gemini untuk structured audio analysis yang berfokus pada indikasi:
   - makhraj atau artikulasi huruf
   - tajwid dan hukum bacaan
   - mad
   - ghunnah
   - qalqalah
   - waqaf dan ibtida
   - lafaz yang berubah atau terlewat
8. UI menampilkan skor latihan per kategori, ringkasan, temuan audio yang cukup jelas, dan saran latihan.

Analisis makhraj dan tajwid adalah **AI-assisted training indication**. Sistem meminta model hanya melaporkan hal yang terdengar dan menggunakan bahasa seperti "terdengar" atau "terindikasi" ketika tidak pasti. Fitur ini bukan penilaian talaqqi final dan tidak menggantikan guru atau ustadz.

## Generate Quiz Al-Qur'an

`/quran-ai/quiz` membuat set quiz baru dari surah dan rentang ayat yang dipilih. Jawaban Qur'an tidak dibuat oleh model. Teks soal dan jawaban benar berasal dari data canonical Quran Foundation API.

Jenis soal yang tersedia:

- Sambung Ayat
- Ayat Berikutnya
- Tebak Nomor Ayat
- Lengkapi Kata yang Hilang

Pengguna dapat memilih 5, 10, 15, atau 20 soal lalu generate ulang set quiz.

## Environment

Salin `.env.example` menjadi `.env.local` lalu isi:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

DATABASE_URL=
DIRECT_URL=

GEMINI_API_KEY=
NEXT_PUBLIC_GEMINI_LIVE_ENABLED=false

# Optional / defaults
QURAN_API_BASE_URL=https://api.quran.com/api/v4
QURAN_FALLBACK_API_BASE_URL=https://api.alquran.cloud/v1
QURAN_RECITATION_ID=1
GEMINI_LIVE_MODEL=gemini-2.5-flash-native-audio-preview-12-2025
GEMINI_ANALYSIS_MODEL=gemini-2.5-flash

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP_NUMBER=6282262170018
NEXT_PUBLIC_WHATSAPP_URL=https://wa.me/6282262170018
NEXT_PUBLIC_INSTAGRAM_URL=https://www.instagram.com/kajian_qu/
```

`GEMINI_API_KEY` harus tetap server-side. Browser menerima ephemeral token berumur pendek untuk Gemini Live, bukan long-lived API key. Kedua model default di atas tersedia pada free tier Gemini Developer API, tetap dengan batas kuota akun Google AI Studio.

Gunakan `NEXT_PUBLIC_GEMINI_LIVE_ENABLED=false` bila jaringan WebSocket Live tidak stabil. Dalam mode ini browser merekam audio secara lokal, lalu server mentranskripsikan dan menganalisis rekaman memakai model HTTP biasa. Ubah ke `true` untuk mencoba transkripsi Live kembali.

`QURAN_RECITATION_ID` adalah ID recitation ayah-by-ayah yang dikirim ke Quran Foundation API untuk audio contoh mode Belajar Al-Qur'an. Bila tidak diisi, aplikasi menggunakan ID `1`.

## Menjalankan aplikasi

```bash
npm install
npm run db:generate
npm run dev
```

## Database, Prisma, dan migration

Supabase dipakai untuk PostgreSQL, Auth, dan Storage. Prisma adalah ORM server-side. Sumber kebenaran perubahan schema berada di `supabase/migrations`, bukan di `prisma/migrations`.

Untuk local Windows atau server persisten yang hanya memiliki IPv4, gunakan Session Pooler gratis pada port `5432` untuk runtime dan operasi schema:

```env
DATABASE_URL=postgresql://postgres.PROJECT_REF:URL_ENCODED_PASSWORD@REGION.pooler.supabase.com:5432/postgres?sslmode=require&connection_limit=5&pool_timeout=30&connect_timeout=30
DIRECT_URL=postgresql://postgres.PROJECT_REF:URL_ENCODED_PASSWORD@REGION.pooler.supabase.com:5432/postgres?sslmode=require&pool_timeout=30&connect_timeout=30
```

Untuk deployment serverless, `DATABASE_URL` dapat memakai Transaction Pooler port `6543` dengan `pgbouncer=true&connection_limit=1&pool_timeout=30&connect_timeout=30`. Pertahankan `DIRECT_URL` pada Session Pooler port `5432` bila host migration hanya mendukung IPv4.

Jangan commit password database atau `SUPABASE_SERVICE_ROLE_KEY`.

Project live KajianQu sudah menerima migration berikut:

- `20260722135753_harden_kajianqu_schema_rls_storage.sql`
- `20260722140007_resolve_database_advisors.sql`

Untuk membuat perubahan schema berikutnya:

```bash
npx supabase login
npx supabase link --project-ref zqubndojitbslbbblllo
npm run db:migration:new nama_perubahan
# edit file SQL baru di supabase/migrations
npm run db:lint
npm run db:push
```

Setelah schema berubah, selaraskan `prisma/schema.prisma`, lalu:

```bash
npm run db:generate
npm run typecheck
```

Migration live memasang RLS, policy per peran, grant Data API, trigger profil, indeks, dan bucket Storage. Bucket `donation-proofs` dan `asatidz-documents` bersifat privat.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm test
npm run verify
npm run db:generate
npm run db:pull
npm run db:validate
npm run db:migration:new nama_perubahan
npm run db:lint
npm run db:push
```
