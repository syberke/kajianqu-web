insert into public.expertise_tags (name, slug, description, sort_order)
values
  ('Al-Qur''an dan Tajwid', 'alquran-tajwid', 'Tahsin, tahfidz, qiraat, dan ilmu Al-Qur''an.', 10),
  ('Fiqih Ibadah', 'fiqih-ibadah', 'Thaharah, shalat, puasa, zakat, dan haji.', 20),
  ('Akhlak dan Adab', 'akhlak-adab', 'Pembinaan karakter, adab, dan tazkiyatun nafs.', 30),
  ('Muamalat', 'muamalat', 'Fiqih transaksi dan kehidupan sosial.', 40)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order;

insert into public.prayer_categories (name, slug, sort_order)
values
  ('Doa Harian', 'doa-harian', 10),
  ('Doa Ibadah', 'doa-ibadah', 20),
  ('Perlindungan', 'perlindungan', 30)
on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order;

insert into public.achievements (code, title, description, icon, target_role)
values
  ('FIRST_QURAN_SESSION', 'Langkah Pertama', 'Menyelesaikan latihan Quran pertama.', 'book-open', 'siswa'),
  ('SEVEN_DAY_STREAK', 'Istiqamah 7 Hari', 'Belajar selama tujuh hari berturut-turut.', 'flame', 'siswa'),
  ('FIRST_PUBLISHED_MATERIAL', 'Kontributor Ilmu', 'Materi pertama berhasil dipublikasikan.', 'graduation-cap', 'asatidz')
on conflict (code) do update set
  title = excluded.title,
  description = excluded.description,
  icon = excluded.icon,
  target_role = excluded.target_role;
