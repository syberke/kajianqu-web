# Arsitektur KajianQu

## Kanal

| Kanal | Teknologi | Fokus |
|---|---|---|
| Mobile | Expo React Native + Expo Router | Pengalaman siswa dan asatidz, mikrofon, AI Quran, chat, notifikasi |
| Web | Expo React Native Web + Expo Router | Web publik dan portal responsif admin, siswa, asatidz |
| Backend | Supabase | Auth, PostgreSQL, RLS, Storage, Realtime, Edge Functions |

Keduanya memiliki deployment terpisah, tetapi memakai paket TypeScript, database, dan kontrak API yang sama.

## Paket

| Paket | Tanggung jawab |
|---|---|
| `design-tokens` | Warna hijau, emas, spacing, radius, shadow, breakpoint |
| `ui-mobile` | Komponen serta layar universal React Native |
| `ui-web` | Chrome navigasi dan footer khusus web, memakai layar universal |
| `api-client` | Supabase, Quran.com API, pemanggilan Edge Function |
| `schemas` | Validasi Zod dan tipe bersama |
| `auth` | Permission matrix dan landing route |
| `quran-core` | Normalisasi Arab dan alignment transkrip |
| `config` | Konfigurasi publik non-secret |

## Alur AI Quran

1. Pengguna memilih mode `murojaah` atau `belajar`.
2. Aplikasi mengambil teks ayat dari Quran.com.
3. Pengguna merekam bacaan dengan `expo-audio`.
4. Audio dikirim ke Edge Function dengan JWT pengguna.
5. Edge Function memvalidasi file lalu mengirimnya ke provider transkripsi.
6. Client membandingkan transkrip dengan teks acuan per kata.
7. Hasil menampilkan akurasi, confidence, kata hilang, tambahan, dan substitusi.
8. Hasil dapat disimpan ke `quran_sessions` dan `quran_practice_segments`.

Provider AI tidak menerima service role key. Kunci Deepgram hanya berada pada secrets Edge Function.
