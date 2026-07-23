# Route Map

## Mobile

- `/`: beranda siswa.
- `/login`, `/register`: autentikasi.
- `/quran`: daftar surah.
- `/quran/[surah]`: pembaca ayat.
- `/ai-quran`: hub AI Quran.
- `/ai-quran/murojaah`: setoran hafalan dengan ayat disembunyikan.
- `/ai-quran/belajar`: latihan dengan teks ayat.
- `/kelas`, `/profil`: tab utama.
- `/siswa`: dashboard siswa.
- `/asatidz`: dashboard asatidz.
- `/admin`: dashboard admin responsif.
- Route fitur lanjutan ditangani oleh placeholder yang jelas sampai modul datanya dihubungkan.

## Web

- `/`: beranda publik.
- `/login`, `/register`: autentikasi.
- `/materi`: materi published.
- `/asatidz-list`: profil asatidz approved.
- `/quran`, `/quran/[surah]`: baca Al-Quran.
- `/ai-quran`, `/ai-quran/murojaah`, `/ai-quran/belajar`: AI Quran.
- `/donasi`: program donasi.
- `/siswa`, `/asatidz`, `/admin`: portal per role.

Semua layar menggunakan ukuran fleksibel. Dashboard mengubah grid dari satu kolom pada layar kecil menjadi dua atau empat kolom pada tablet dan desktop.
