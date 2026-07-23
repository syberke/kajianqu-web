-- KajianQu production schema alignment, RLS hardening, indexes, and Storage.
-- Designed to preserve the existing production rows while upgrading legacy tables.

create extension if not exists pgcrypto;
create schema if not exists app_private;

-- Additive ORM alignment. Legacy private classes remain nullable until assigned by an admin.
alter table public.materials add column if not exists level text;
alter table public.materials add column if not exists review_status text not null default 'pending';
alter table public.materials add column if not exists review_note text;
alter table public.materials alter column youtube_url drop not null;

alter table public.live_sessions add column if not exists stream_url text;
alter table public.live_sessions alter column youtube_url drop not null;

alter table public.private_class_pages add column if not exists asatidz_id uuid;
alter table public.private_class_pages add column if not exists zoom_link text;
alter table public.private_class_pages add column if not exists passcode text;

alter table public.quiz_attempts add column if not exists duration_seconds integer;
alter table public.donation_products add column if not exists price numeric(18,2);
alter table public.donation_products add column if not exists stock integer not null default 0;
alter table public.messages add column if not exists conversation_id uuid;
alter table public.quran_sessions add column if not exists transcript text;
alter table public.quran_mistakes add column if not exists kind text;
alter table public.quran_mistakes add column if not exists confidence double precision;

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  role_label text,
  content text not null,
  rating integer check (rating between 1 and 5),
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Normalize existing rows without replacing user-authored content.
update public.profiles set role = 'siswa' where role is null;
update public.profiles
set nama = coalesce(nullif(btrim(nama), ''), nullif(split_part(coalesce(email, ''), '@', 1), ''), 'Pengguna')
where nama is null or btrim(nama) = '';
update public.profiles set email = '' where email is null;
update public.profiles set is_active = true where is_active is null;
update public.profiles set created_at = now() where created_at is null;
update public.profiles set updated_at = now() where updated_at is null;

update public.asatidz_profiles set approved = false where approved is null;
update public.asatidz_profiles set created_at = now() where created_at is null;
update public.asatidz_profiles set updated_at = now() where updated_at is null;

update public.keilmuan set is_active = true where is_active is null;
update public.keilmuan set created_at = now() where created_at is null;

update public.materials set is_published = false where is_published is null;
update public.materials
set review_status = case when is_published then 'approved' else 'pending' end
where review_status is null or (is_published and review_status = 'pending');
update public.materials set created_at = now() where created_at is null;
update public.materials set updated_at = now() where updated_at is null;

update public.live_sessions set status = 'upcoming' where status is null;
update public.live_sessions set created_at = now() where created_at is null;
update public.live_sessions set updated_at = now() where updated_at is null;

update public.private_class_pages set is_active = true where is_active is null;
update public.private_class_pages set created_at = now() where created_at is null;
update public.private_class_pages set updated_at = now() where updated_at is null;

update public.private_class_enrollments set status = 'pending' where status is null;
update public.private_class_enrollments set created_at = now() where created_at is null;

update public.donation_products set is_active = true where is_active is null;
update public.donation_products set stock = 0 where stock is null;
update public.donation_products set created_at = now() where created_at is null;
update public.donation_products set updated_at = now() where updated_at is null;

update public.messages set is_read = false where is_read is null;
update public.messages set created_at = now() where created_at is null;
update public.quran_sessions set mistakes = '[]'::jsonb where mistakes is null;
update public.quran_sessions set created_at = now() where created_at is null;
update public.quran_mistakes set created_at = now() where created_at is null;

-- Preserve current nullable compatibility while enforcing safe defaults.
alter table public.profiles alter column role set not null;
alter table public.profiles alter column nama set not null;
alter table public.profiles alter column email set not null;
alter table public.profiles alter column is_active set default true;
alter table public.profiles alter column is_active set not null;
alter table public.profiles alter column created_at set default now();
alter table public.profiles alter column created_at set not null;
alter table public.profiles alter column updated_at set default now();
alter table public.profiles alter column updated_at set not null;

alter table public.asatidz_profiles alter column approved set default false;
alter table public.asatidz_profiles alter column approved set not null;
alter table public.asatidz_profiles alter column created_at set default now();
alter table public.asatidz_profiles alter column created_at set not null;
alter table public.asatidz_profiles alter column updated_at set default now();
alter table public.asatidz_profiles alter column updated_at set not null;

alter table public.materials alter column is_published set default false;
alter table public.materials alter column is_published set not null;
alter table public.materials alter column review_status set default 'pending';
alter table public.materials alter column review_status set not null;

alter table public.private_class_enrollments alter column status set default 'pending';
alter table public.private_class_enrollments alter column status set not null;
alter table public.donation_products alter column stock set default 0;
alter table public.donation_products alter column stock set not null;

-- Replace narrow legacy checks with the values used by the application.
alter table public.donations drop constraint if exists donations_payment_status_check;
alter table public.donations add constraint donations_payment_status_check
  check (payment_status in ('pending', 'paid', 'verified', 'rejected', 'failed', 'manual_review'));

alter table public.private_class_enrollments drop constraint if exists private_class_enrollments_status_check;
alter table public.private_class_enrollments add constraint private_class_enrollments_status_check
  check (status in ('pending', 'approved', 'rejected', 'active', 'completed', 'cancelled'));

alter table public.live_sessions drop constraint if exists live_sessions_status_check;
alter table public.live_sessions add constraint live_sessions_status_check
  check (status in ('upcoming', 'live', 'ended', 'cancelled'));

alter table public.quran_ai_sessions drop constraint if exists quran_ai_sessions_mode_check;
alter table public.quran_ai_sessions add constraint quran_ai_sessions_mode_check
  check (mode in ('tahfidz', 'tahsin', 'murojaah', 'belajar'));

alter table public.quran_sessions drop constraint if exists quran_sessions_mode_check;
alter table public.quran_sessions add constraint quran_sessions_mode_check
  check (mode in ('tahfidz', 'tahsin', 'murojaah', 'belajar'));

alter table public.materials drop constraint if exists materials_review_status_check;
alter table public.materials add constraint materials_review_status_check
  check (review_status in ('pending', 'approved', 'rejected'));

alter table public.donation_products drop constraint if exists donation_products_stock_check;
alter table public.donation_products add constraint donation_products_stock_check check (stock >= 0);

alter table public.messages drop constraint if exists messages_content_length_check;
alter table public.messages add constraint messages_content_length_check
  check (char_length(content) between 1 and 4000);

alter table public.quran_mistakes drop constraint if exists quran_mistakes_confidence_check;
alter table public.quran_mistakes add constraint quran_mistakes_confidence_check
  check (confidence is null or confidence between 0 and 1);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'private_class_pages_asatidz_id_fkey'
      and conrelid = 'public.private_class_pages'::regclass
  ) then
    alter table public.private_class_pages
      add constraint private_class_pages_asatidz_id_fkey
      foreign key (asatidz_id) references public.profiles(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'messages_conversation_id_fkey'
      and conrelid = 'public.messages'::regclass
  ) then
    alter table public.messages
      add constraint messages_conversation_id_fkey
      foreign key (conversation_id) references public.conversations(id) on delete set null;
  end if;
end $$;

-- Cover foreign keys and common list/detail access patterns.
create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_is_active_idx on public.profiles(is_active);
create index if not exists asatidz_profiles_approved_idx on public.asatidz_profiles(approved);
create index if not exists keilmuan_active_idx on public.keilmuan(is_active);
create index if not exists materials_asatidz_created_idx on public.materials(asatidz_id, created_at desc);
create index if not exists materials_keilmuan_idx on public.materials(keilmuan_id);
create index if not exists materials_published_created_idx on public.materials(is_published, created_at desc);
create index if not exists materials_review_created_idx on public.materials(review_status, created_at desc);
create index if not exists live_sessions_asatidz_idx on public.live_sessions(asatidz_id);
create index if not exists live_sessions_status_schedule_idx on public.live_sessions(status, scheduled_at);
create index if not exists private_class_asatidz_created_idx on public.private_class_pages(asatidz_id, created_at desc);
create index if not exists private_class_active_created_idx on public.private_class_pages(is_active, created_at desc);
create index if not exists private_enrollment_student_created_idx on public.private_class_enrollments(student_id, created_at desc);
create index if not exists private_enrollment_class_created_idx on public.private_class_enrollments(class_id, created_at desc);
create unique index if not exists private_enrollment_class_student_uidx on public.private_class_enrollments(class_id, student_id);
create index if not exists quizzes_material_idx on public.quizzes(material_id);
create index if not exists quizzes_creator_created_idx on public.quizzes(created_by, created_at desc);
create index if not exists quizzes_active_created_idx on public.quizzes(is_active, created_at desc);
create index if not exists quiz_questions_quiz_order_idx on public.quiz_questions(quiz_id, order_no);
create index if not exists quiz_attempts_user_created_idx on public.quiz_attempts(user_id, created_at desc);
create index if not exists quiz_attempts_quiz_created_idx on public.quiz_attempts(quiz_id, created_at desc);
create index if not exists quran_ai_user_created_idx on public.quran_ai_sessions(user_id, created_at desc);
create index if not exists quran_ai_status_created_idx on public.quran_ai_sessions(status, created_at desc);
create index if not exists donation_methods_active_created_idx on public.donation_methods(is_active, created_at desc);
create index if not exists donations_status_created_idx on public.donations(payment_status, created_at desc);
create index if not exists donations_user_created_idx on public.donations(user_id, created_at desc);
create index if not exists donations_method_idx on public.donations(method_id);
create index if not exists donation_products_active_created_idx on public.donation_products(is_active, created_at desc);
create unique index if not exists conversations_student_asatidz_uidx on public.conversations(student_id, asatidz_id);
create index if not exists conversations_student_idx on public.conversations(student_id);
create index if not exists conversations_asatidz_idx on public.conversations(asatidz_id);
create index if not exists messages_conversation_created_idx on public.messages(conversation_id, created_at);
create index if not exists messages_receiver_created_idx on public.messages(receiver_id, created_at desc);
create index if not exists messages_sender_created_idx on public.messages(sender_id, created_at desc);
create index if not exists material_progress_material_idx on public.material_progress(material_id);
create index if not exists quran_sessions_user_created_idx on public.quran_sessions(user_id, created_at desc);
create index if not exists quran_mistakes_session_idx on public.quran_mistakes(session_id);
create index if not exists quran_mistakes_user_created_idx on public.quran_mistakes(user_id, created_at desc);
create index if not exists prayer_locations_active_city_idx on public.prayer_locations(is_active, city_name);
create index if not exists prayer_schedules_date_idx on public.prayer_schedules(schedule_date);
create index if not exists notifications_recipient_read_created_idx on public.notifications(recipient_id, is_read, created_at desc);
create index if not exists activity_logs_user_created_idx on public.activity_logs(user_id, created_at desc);
create index if not exists activity_logs_type_created_idx on public.activity_logs(type, created_at desc);
create index if not exists testimonials_approved_created_idx on public.testimonials(is_approved, created_at desc);
create index if not exists testimonials_user_created_idx on public.testimonials(user_id, created_at desc);

-- Internal authorization helpers avoid JWT user_metadata and RLS recursion.
create or replace function app_private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin' and is_active = true
  )
$$;

create or replace function app_private.is_asatidz()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles profile
    left join public.asatidz_profiles detail on detail.id = profile.id
    where profile.id = (select auth.uid())
      and profile.is_active = true
      and (profile.role = 'admin' or (profile.role = 'asatidz' and detail.approved = true))
  )
$$;

create or replace function app_private.can_message(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles sender
    join public.profiles receiver on receiver.id = target_user_id
    where sender.id = (select auth.uid())
      and sender.is_active = true
      and receiver.is_active = true
      and (
        sender.role = 'admin'
        or (sender.role = 'siswa' and receiver.role = 'asatidz')
        or (sender.role = 'asatidz' and receiver.role = 'siswa')
      )
  )
$$;

create or replace function app_private.can_manage_private_class(class_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select app_private.is_admin() or exists (
    select 1 from public.private_class_pages class
    where class.id = class_uuid and class.asatidz_id = (select auth.uid())
  )
$$;

create or replace function app_private.can_access_private_class(class_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select app_private.can_manage_private_class(class_uuid) or exists (
    select 1 from public.private_class_enrollments enrollment
    where enrollment.class_id = class_uuid
      and enrollment.student_id = (select auth.uid())
      and enrollment.status in ('approved', 'active', 'completed')
  )
$$;

revoke all on schema app_private from public;
grant usage on schema app_private to authenticated;
revoke all on all functions in schema app_private from public, anon;
grant execute on function app_private.is_admin() to authenticated;
grant execute on function app_private.is_asatidz() to authenticated;
grant execute on function app_private.can_message(uuid) to authenticated;
grant execute on function app_private.can_manage_private_class(uuid) to authenticated;
grant execute on function app_private.can_access_private_class(uuid) to authenticated;

-- Preserve legacy RPC names with safe database-backed authorization.
create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$ select app_private.is_admin() $$;

create or replace function public.get_my_role()
returns text
language sql
stable
security invoker
set search_path = ''
as $$ select role from public.profiles where id = (select auth.uid()) $$;

revoke all on function public.is_admin() from public, anon;
revoke all on function public.get_my_role() from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.get_my_role() to authenticated;

do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke all on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end $$;

-- Profile lifecycle and timestamps.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_role text;
begin
  requested_role := case
    when new.raw_user_meta_data ->> 'role' in ('siswa', 'asatidz')
      then new.raw_user_meta_data ->> 'role'
    else 'siswa'
  end;

  insert into public.profiles (id, role, nama, email)
  values (
    new.id,
    requested_role,
    coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'nama'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Pengguna'
    ),
    coalesce(new.email, '')
  )
  on conflict (id) do nothing;

  return new;
end
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end
$$;

revoke all on function public.handle_new_auth_user() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'profiles','asatidz_profiles','materials','live_sessions','private_class_pages',
    'quran_ai_sessions','donations','donation_products','material_progress','settings','testimonials'
  ] loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', table_name, table_name);
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name, table_name);
  end loop;
end $$;

-- Replace policies only on KajianQu-managed tables.
do $$
declare policy_row record;
begin
  for policy_row in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = any (array[
        'profiles','asatidz_profiles','keilmuan','materials','live_sessions','private_class_pages',
        'private_class_enrollments','quizzes','quiz_questions','quiz_attempts','quran_ai_sessions',
        'donation_methods','donations','donation_products','conversations','messages','material_progress',
        'quran_sessions','quran_mistakes','prayer_locations','prayer_schedules','notifications','settings',
        'activity_logs','testimonials'
      ])
  loop
    execute format('drop policy if exists %I on %I.%I', policy_row.policyname, policy_row.schemaname, policy_row.tablename);
  end loop;
end $$;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'profiles','asatidz_profiles','keilmuan','materials','live_sessions','private_class_pages',
    'private_class_enrollments','quizzes','quiz_questions','quiz_attempts','quran_ai_sessions',
    'donation_methods','donations','donation_products','conversations','messages','material_progress',
    'quran_sessions','quran_mistakes','prayer_locations','prayer_schedules','notifications','settings',
    'activity_logs','testimonials'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on table public.%I from anon, authenticated', table_name);
  end loop;
end $$;

-- The 2026 Data API no longer auto-exposes new tables, so grants are explicit.
grant select on public.keilmuan, public.materials, public.live_sessions, public.quizzes,
  public.donation_methods, public.donation_products, public.prayer_locations,
  public.prayer_schedules, public.testimonials to anon;

grant select on public.profiles, public.asatidz_profiles, public.keilmuan, public.materials,
  public.live_sessions, public.private_class_pages, public.private_class_enrollments, public.quizzes,
  public.quiz_questions, public.quiz_attempts, public.quran_ai_sessions, public.donation_methods,
  public.donations, public.donation_products, public.conversations, public.messages,
  public.material_progress, public.quran_sessions, public.quran_mistakes, public.prayer_locations,
  public.prayer_schedules, public.notifications, public.settings, public.activity_logs,
  public.testimonials to authenticated;

-- Application mutations go through validated Next.js routes/Prisma or service-role Edge Functions.
create policy profiles_select_own_or_admin on public.profiles for select to authenticated
  using ((select auth.uid()) = id or (select app_private.is_admin()));

create policy asatidz_profile_select_own_or_admin on public.asatidz_profiles for select to authenticated
  using ((select auth.uid()) = id or (select app_private.is_admin()));

create policy keilmuan_public_select on public.keilmuan for select to anon using (is_active);
create policy keilmuan_authenticated_select on public.keilmuan for select to authenticated
  using (is_active or (select app_private.is_admin()));

create policy materials_public_select on public.materials for select to anon
  using (is_published and review_status = 'approved');
create policy materials_authenticated_select on public.materials for select to authenticated
  using (
    (is_published and review_status = 'approved')
    or asatidz_id = (select auth.uid())
    or (select app_private.is_admin())
  );

create policy live_public_select on public.live_sessions for select to anon using (status <> 'cancelled');
create policy live_authenticated_select on public.live_sessions for select to authenticated
  using (status <> 'cancelled' or asatidz_id = (select auth.uid()) or (select app_private.is_admin()));

create policy private_class_authenticated_select on public.private_class_pages for select to authenticated
  using ((select app_private.can_access_private_class(id)));

create policy enrollment_select_related on public.private_class_enrollments for select to authenticated
  using (
    student_id = (select auth.uid())
    or (select app_private.can_manage_private_class(class_id))
  );

create policy quizzes_public_select on public.quizzes for select to anon using (is_active);
create policy quizzes_authenticated_select on public.quizzes for select to authenticated
  using (is_active or created_by = (select auth.uid()) or (select app_private.is_admin()));
create policy quiz_questions_authenticated_select on public.quiz_questions for select to authenticated
  using (
    exists (
      select 1 from public.quizzes quiz
      where quiz.id = quiz_id and (quiz.is_active or quiz.created_by = (select auth.uid()))
    )
    or (select app_private.is_admin())
  );
create policy quiz_attempts_own_select on public.quiz_attempts for select to authenticated
  using (user_id = (select auth.uid()) or (select app_private.is_admin()));

create policy quran_ai_own_select on public.quran_ai_sessions for select to authenticated
  using (user_id = (select auth.uid()) or (select app_private.is_admin()));

create policy donation_methods_public_select on public.donation_methods for select to anon using (is_active);
create policy donation_methods_authenticated_select on public.donation_methods for select to authenticated
  using (is_active or (select app_private.is_admin()));
create policy donation_products_public_select on public.donation_products for select to anon using (is_active);
create policy donation_products_authenticated_select on public.donation_products for select to authenticated
  using (is_active or (select app_private.is_admin()));
create policy donations_own_select on public.donations for select to authenticated
  using (user_id = (select auth.uid()) or (select app_private.is_admin()));

create policy conversations_participant_select on public.conversations for select to authenticated
  using (student_id = (select auth.uid()) or asatidz_id = (select auth.uid()) or (select app_private.is_admin()));
create policy messages_participant_select on public.messages for select to authenticated
  using (sender_id = (select auth.uid()) or receiver_id = (select auth.uid()) or (select app_private.is_admin()));

create policy progress_own_select on public.material_progress for select to authenticated
  using (user_id = (select auth.uid()) or (select app_private.is_admin()));
create policy quran_sessions_own_select on public.quran_sessions for select to authenticated
  using (user_id = (select auth.uid()) or (select app_private.is_admin()));
create policy quran_mistakes_own_select on public.quran_mistakes for select to authenticated
  using (user_id = (select auth.uid()) or (select app_private.is_admin()));

create policy prayer_locations_public_select on public.prayer_locations for select to anon using (is_active);
create policy prayer_locations_authenticated_select on public.prayer_locations for select to authenticated
  using (is_active or (select app_private.is_admin()));
create policy prayer_schedules_public_select on public.prayer_schedules for select to anon using (true);
create policy prayer_schedules_authenticated_select on public.prayer_schedules for select to authenticated using (true);

create policy notifications_own_select on public.notifications for select to authenticated
  using (recipient_id = (select auth.uid()) or (select app_private.is_admin()));
create policy settings_admin_select on public.settings for select to authenticated
  using ((select app_private.is_admin()));
create policy activity_logs_admin_select on public.activity_logs for select to authenticated
  using ((select app_private.is_admin()));

create policy testimonials_public_select on public.testimonials for select to anon using (is_approved);
create policy testimonials_authenticated_select on public.testimonials for select to authenticated
  using (is_approved or user_id = (select auth.uid()) or (select app_private.is_admin()));

-- Storage buckets and per-user folder access.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('material-covers', 'material-covers', true, 10485760, array['image/jpeg','image/png','image/webp']),
  ('donation-proofs', 'donation-proofs', false, 10485760, array['image/jpeg','image/png','image/webp','application/pdf']),
  ('asatidz-documents', 'asatidz-documents', false, 15728640, array['image/jpeg','image/png','application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists avatars_public_read on storage.objects;
drop policy if exists avatars_owner_insert on storage.objects;
drop policy if exists avatars_owner_update on storage.objects;
drop policy if exists avatars_owner_delete on storage.objects;
drop policy if exists material_covers_public_read on storage.objects;
drop policy if exists material_covers_asatidz_insert on storage.objects;
drop policy if exists material_covers_asatidz_update on storage.objects;
drop policy if exists material_covers_asatidz_delete on storage.objects;
drop policy if exists donation_proofs_owner_select on storage.objects;
drop policy if exists donation_proofs_owner_insert on storage.objects;
drop policy if exists donation_proofs_owner_update on storage.objects;
drop policy if exists donation_proofs_owner_delete on storage.objects;
drop policy if exists asatidz_documents_owner_select on storage.objects;
drop policy if exists asatidz_documents_owner_insert on storage.objects;
drop policy if exists asatidz_documents_owner_update on storage.objects;
drop policy if exists asatidz_documents_owner_delete on storage.objects;

create policy avatars_public_read on storage.objects for select to public using (bucket_id = 'avatars');
create policy avatars_owner_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy avatars_owner_update on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select app_private.is_admin())))
  with check (bucket_id = 'avatars' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select app_private.is_admin())));
create policy avatars_owner_delete on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select app_private.is_admin())));

create policy material_covers_public_read on storage.objects for select to public using (bucket_id = 'material-covers');
create policy material_covers_asatidz_insert on storage.objects for insert to authenticated
  with check (
    bucket_id = 'material-covers'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (select app_private.is_asatidz())
  );
create policy material_covers_asatidz_update on storage.objects for update to authenticated
  using (bucket_id = 'material-covers' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select app_private.is_admin())))
  with check (bucket_id = 'material-covers' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select app_private.is_admin())));
create policy material_covers_asatidz_delete on storage.objects for delete to authenticated
  using (bucket_id = 'material-covers' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select app_private.is_admin())));

create policy donation_proofs_owner_select on storage.objects for select to authenticated
  using (bucket_id = 'donation-proofs' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select app_private.is_admin())));
create policy donation_proofs_owner_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'donation-proofs' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy donation_proofs_owner_update on storage.objects for update to authenticated
  using (bucket_id = 'donation-proofs' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select app_private.is_admin())))
  with check (bucket_id = 'donation-proofs' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select app_private.is_admin())));
create policy donation_proofs_owner_delete on storage.objects for delete to authenticated
  using (bucket_id = 'donation-proofs' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select app_private.is_admin())));

create policy asatidz_documents_owner_select on storage.objects for select to authenticated
  using (bucket_id = 'asatidz-documents' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select app_private.is_admin())));
create policy asatidz_documents_owner_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'asatidz-documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy asatidz_documents_owner_update on storage.objects for update to authenticated
  using (bucket_id = 'asatidz-documents' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select app_private.is_admin())))
  with check (bucket_id = 'asatidz-documents' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select app_private.is_admin())));
create policy asatidz_documents_owner_delete on storage.objects for delete to authenticated
  using (bucket_id = 'asatidz-documents' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select app_private.is_admin())));
