# Security Checklist

- [x] Service role dan provider API key tidak berada di bundle aplikasi.
- [x] Menggunakan publishable key pada client.
- [x] RLS aktif pada tabel baru.
- [x] Helper privileged berada pada schema `private`, akses publik dicabut.
- [x] Policy memeriksa ownership atau keanggotaan room.
- [x] Edge Function AI memerlukan JWT.
- [x] Ukuran dan MIME audio dibatasi.
- [x] Dokumen asatidz, bukti finansial, dan chat berada pada private bucket.
- [x] URL private diberikan melalui signed URL berumur pendek pada implementasi server.
- [x] Chat hanya dapat dibaca anggota room.
- [x] Audit log bersifat append-only bagi client.
- [x] Idempotency tersedia untuk donasi, payout, dan job.
- [ ] MFA admin harus diaktifkan melalui konfigurasi Auth sebelum produksi.
- [ ] CAPTCHA dan rate limit gateway perlu dikonfigurasi sesuai traffic nyata.
- [ ] Malware scanning attachment perlu dihubungkan sebelum upload produksi.
- [ ] Backup restore test harus dijadwalkan dan dicatat.

Tidak ada klaim bahwa sistem sepenuhnya aman. Checklist ini merupakan defense in depth dan harus disertai monitoring serta review berkala.
