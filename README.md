# KajianQu Platform

Monorepo KajianQu dengan frontend web dan mobile yang terpisah:

- `apps/mobile`: Expo React Native untuk Android dan iOS.
- `apps/web`: Next.js App Router untuk web publik dan dashboard admin, siswa, serta asatidz.
- `packages/*`: design tokens, UI, schema, auth, API client, dan Quran core yang dipakai bersama.
- `supabase/*`: migration, seed, RLS, Storage, dan Edge Function.

Kedua aplikasi memakai satu project Supabase dan satu kontrak data. Modul pembaca Al-Quran dipisahkan dari AI Quran:

- **Al-Quran**: daftar surah dan tampilan ayat dari Quran.com API v4.
- **AI Quran**: `murojaah` dan `belajar`, perekaman audio, transkripsi server-side, pencocokan kata, confidence, serta rincian kata benar, tertukar, hilang, atau tambahan.

Hasil AI hanya bantuan latihan dan bukan pengganti validasi asatidz.

## Prasyarat

- Node.js 22 atau lebih baru.
- npm 10 atau lebih baru.
- Android Studio untuk Android lokal.
- Xcode untuk iOS lokal, hanya pada macOS.
- Project Supabase.

## Setup

```bash
npm install
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env
```

Untuk mobile, isi publishable key:

```env
EXPO_PUBLIC_SUPABASE_URL=https://zqubndojitbslbbblllo.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
```

Jangan pernah menaruh secret key atau service role key pada environment `EXPO_PUBLIC_*`.

Untuk web Next.js, isi sekurangnya:

```env
NEXT_PUBLIC_SUPABASE_URL=https://zqubndojitbslbbblllo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
DATABASE_URL=...
DIRECT_URL=...
```

`SUPABASE_SERVICE_ROLE_KEY` dan `GEMINI_API_KEY` hanya boleh tersedia pada environment server.

## Menjalankan

Mobile:

```bash
npm run dev:mobile
```

Web:

```bash
npm run dev:web
```

Web berjalan di `http://localhost:3000`.

Build web Next.js:

```bash
npm run build:web
```

Vercel membaca `vercel.json` di root dan menerbitkan build Next.js dari
`apps/web/.next`.

Pemeriksaan lengkap:

```bash
npm run check
```

## Supabase

Migration utama:

```text
supabase/migrations/20260723084324_kajianqu_react_native_platform.sql
supabase/migrations/20260723090000_complete_product_access.sql
supabase/migrations/20260723092500_harden_public_directory.sql
```

Untuk lingkungan baru:

```bash
supabase link --project-ref zqubndojitbslbbblllo
supabase db push
supabase db seed
```

Edge Function transkripsi:

```bash
supabase secrets set DEEPGRAM_API_KEY=...
supabase secrets set QURAN_TRANSCRIPTION_MODEL=nova-3
supabase functions deploy quran-transcribe
```

Fungsi ini memerlukan JWT, membatasi ukuran dan tipe file, dan menyimpan API key hanya di server.

## Catatan AI Quran

- Batas UI per rekaman adalah 3 menit.
- Untuk akurasi, gunakan rentang ayat pendek dan lingkungan tenang.
- Pencocokan kata tidak mengklaim dapat menilai seluruh hukum tajwid.
- Hasil confidence rendah harus divalidasi asatidz.
- Transkripsi dan penilaian dipisahkan agar provider dapat diganti tanpa mengubah UI.

## Fitur yang terhubung

- Katalog dan detail materi dengan filter tingkat.
- Direktori publik asatidz yang hanya menyimpan field aman.
- Kelas private, permintaan bergabung, dan chat kelas berbasis keanggotaan.
- Live event, donasi, doa, dzikir, quote, kiblat, Bahtsul Masail, dan Muamalat.
- Chat realtime, profil, riwayat Quran, dan achievement.
- Trigger pendaftaran untuk membuat profil siswa atau asatidz secara otomatis.

## Dokumen

- [Arsitektur](docs/architecture.md)
- [Route map](docs/routes.md)
- [Role dan permission](docs/role-permission.md)
- [Workflow](docs/workflows.md)
- [Security checklist](docs/security.md)
- [Testing dan scaling](docs/testing-scaling.md)
