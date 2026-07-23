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

- `/`: beranda publik.
- `/login`, `/register`: autentikasi.
- `/materi`: materi published.
- `/materi/[identifier]`: detail materi.
- `/asatidz-list`: profil asatidz approved.
- `/asatidz/[id]`: detail asatidz dan kelas tersedia.
- `/quran`, `/quran/[surah]`: baca Al-Quran.
- `/quran/riwayat`, `/achievement`: histori latihan dan milestone.
- `/ai-quran`, `/ai-quran/murojaah`, `/ai-quran/belajar`: AI Quran.
- `/donasi`: program donasi.
- `/kelas`, `/live`, `/chat`, `/chat/[roomId]`: kelas, acara, dan pesan realtime.
- `/doa`, `/dzikir`, `/quote`, `/kiblat`: layanan ibadah harian.
- `/bahtsul-masail`, `/muamalat`: ruang diskusi.
- `/profile`: profil pengguna.
- `/siswa`, `/asatidz`, `/admin`: portal per role.

Semua layar menggunakan ukuran fleksibel. Dashboard mengubah grid dari satu kolom pada layar kecil menjadi dua atau empat kolom pada tablet dan desktop.
