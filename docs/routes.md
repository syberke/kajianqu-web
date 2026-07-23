# Route Map

## Mobile

- `/`: beranda siswa.
- `/login`, `/register`: autentikasi.
- `/quran`: daftar surah.
- `/quran/[surah]`: pembaca ayat.
- `/ai-quran`: hub AI Quran.
- `/ai-quran/murojaah`: setoran hafalan dengan ayat disembunyikan.
- `/ai-quran/belajar`: latihan dengan teks ayat.
- `/kelas`, `/chat`, `/profil`: tab utama.
- `/materi`, `/materi/[identifier]`: katalog dan detail materi.
- `/asatidz-list`, `/asatidz/[id]`: direktori dan profil publik asatidz.
- `/live`, `/donasi`, `/doa`, `/dzikir`, `/quote`, `/kiblat`: layanan harian.
- `/bahtsul-masail`, `/muamalat`: ruang diskusi.
- `/chat/[roomId]`: ruang chat realtime.
- `/quran/riwayat`, `/achievement`: histori dan milestone.
- `/siswa`: dashboard siswa.
- `/asatidz`: dashboard asatidz.
- `/admin`: dashboard admin responsif.
- Route yang tidak dikenal menampilkan halaman 404 dan tombol kembali ke beranda.

## Web

- `/` mengarahkan ke `/welcome`, beranda publik dengan desain KajianQu.
- `/login`, `/register/siswa`, `/register/asatidz`: autentikasi.
- `/keilmuan`, `/keilmuan/[id]`: katalog dan detail materi published.
- `/materi`: alias kompatibel ke `/keilmuan`.
- `/ustadz`, `/ustadz/[id]`: profil asatidz approved.
- `/asatidz-list`: alias kompatibel ke `/ustadz`.
- `/sahabat-quran`: baca Al-Quran.
- `/quran`: alias kompatibel ke `/sahabat-quran`.
- `/quran-ai`, `/quran-ai/murojaah/[surahId]`, `/quran-ai/belajar/[surahId]`, `/quran-ai/quiz`: AI Quran.
- `/ai-quran`: alias kompatibel ke `/quran-ai`.
- `/donasi` dan turunannya: program serta transaksi donasi.
- `/kelas`, `/live`, `/chat`: kelas, acara, dan pesan.
- `/doa`, `/dzikir`, `/quote`, `/kiblat`: layanan ibadah harian.
- `/bahtsul-masail`, `/muamalat`, `/achievement`: diskusi dan progres belajar.
- `/profile`: profil pengguna.
- `/dashboard/siswa`, `/dashboard/asatidz`, `/dashboard/admin`: portal per role.

Semua layar menggunakan ukuran fleksibel. Dashboard mengubah tabel menjadi kartu atau scroll terkontrol pada layar kecil.
