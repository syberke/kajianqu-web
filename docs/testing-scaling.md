# Testing dan Scaling

## Pemeriksaan lokal

`npm run check` menjalankan:

1. Typecheck semua workspace.
2. Unit test permission dan alignment bacaan.
3. Static export web.

Sebelum produksi tambahkan E2E perangkat untuk registrasi, approval asatidz, publish materi, payout, donasi, kelas, dan chat.

## Responsive matrix

Uji web pada lebar 360, 390, 768, 1024, dan 1440 px. Komponen menggunakan `useWindowDimensions`, flex wrapping, ukuran minimum kartu, dan konten maksimal 1240 px.

## Scaling

- Cache data surah dan konten publik.
- Gunakan cursor pagination untuk chat, materi, transaksi, dan audit log.
- Gunakan Realtime private channels untuk chat.
- Proses transkripsi dan quiz AI sebagai background job saat volume meningkat.
- Simpan attachment di Storage, bukan payload Realtime.
- Pantau latency, error rate, database load, backlog job, dan koneksi Realtime.
- Lakukan load test sebelum membuat klaim kapasitas.
