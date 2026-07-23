-- Applied to production as migration version 20260723084324.
begin;

create extension if not exists pgcrypto;
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
      and is_active = true
  );
$$;
revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'siswa', 'asatidz')),
  granted_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create table if not exists public.student_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  birth_date date,
  gender text check (gender is null or gender in ('male', 'female', 'undisclosed')),
  address_summary text,
  learning_preferences text[] not null default '{}',
  learning_target text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.asatidz_profiles
  add column if not exists status text not null default 'PENDING_PROFILE'
    check (status in ('PENDING_PROFILE','PENDING_REVIEW','REVISION_REQUIRED','APPROVED','REJECTED','SUSPENDED')),
  add column if not exists asatidz_code text,
  add column if not exists title text,
  add column if not exists formal_education text,
  add column if not exists nonformal_education text,
  add column if not exists memorization_juz numeric(4,1),
  add column if not exists sanad_history text,
  add column if not exists bank_account_name text,
  add column if not exists teaching_area text,
  add column if not exists availability jsonb not null default '{}'::jsonb;

create unique index if not exists asatidz_profiles_code_uq
  on public.asatidz_profiles(asatidz_code)
  where asatidz_code is not null;

create table if not exists public.asatidz_documents (
  id uuid primary key default gen_random_uuid(),
  asatidz_id uuid not null references public.asatidz_profiles(id) on delete cascade,
  document_type text not null check (document_type in ('cv','certificate','sanad','identity','other')),
  storage_path text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 10485760),
  status text not null default 'pending' check (status in ('pending','verified','rejected')),
  uploaded_at timestamptz not null default now(),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz
);

create table if not exists public.expertise_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.asatidz_expertise (
  asatidz_id uuid not null references public.asatidz_profiles(id) on delete cascade,
  tag_id uuid not null references public.expertise_tags(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (asatidz_id, tag_id)
);

alter table public.materials
  add column if not exists workflow_status text not null default 'DRAFT'
    check (workflow_status in ('DRAFT','SUBMITTED','IN_REVIEW','REVISION_REQUIRED','APPROVED','PUBLISHED','REJECTED','ARCHIVED')),
  add column if not exists published_at timestamptz,
  add column if not exists published_by uuid references auth.users(id),
  add column if not exists language text not null default 'id',
  add column if not exists references_text text;

create table if not exists public.material_versions (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null references public.materials(id) on delete cascade,
  version_number integer not null check (version_number > 0),
  snapshot jsonb not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique (material_id, version_number)
);

create table if not exists public.material_reviews (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null references public.materials(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id),
  decision text not null check (decision in ('comment','revision_required','approved','rejected')),
  note text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  label text not null,
  content text not null,
  is_correct boolean not null default false,
  sort_order integer not null default 0
);

create table if not exists public.quiz_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.quiz_attempts(id) on delete cascade,
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  selected_option_id uuid references public.quiz_options(id),
  text_answer text,
  is_correct boolean,
  score numeric(8,2),
  answered_at timestamptz not null default now(),
  unique (attempt_id, question_id)
);

create table if not exists public.quran_practice_segments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.quran_sessions(id) on delete cascade,
  ayah_number integer not null check (ayah_number > 0),
  expected_text text not null,
  transcript text,
  feedback jsonb not null default '[]'::jsonb,
  confidence numeric(5,4) check (confidence is null or confidence between 0 and 1),
  created_at timestamptz not null default now()
);

create table if not exists public.private_classes (
  id uuid primary key default gen_random_uuid(),
  asatidz_id uuid not null references public.asatidz_profiles(id),
  title text not null,
  description text,
  cover_path text,
  capacity integer not null default 20 check (capacity > 0),
  price numeric(14,2) not null default 0 check (price >= 0),
  starts_at timestamptz,
  ends_at timestamptz,
  registration_status text not null default 'open' check (registration_status in ('draft','open','closed','ongoing','completed','cancelled')),
  rules text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.class_members (
  class_id uuid not null references public.private_classes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','active','rejected','completed','cancelled')),
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (class_id, user_id)
);

create table if not exists public.class_sessions (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.private_classes(id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  duration_minutes integer not null check (duration_minutes between 10 and 480),
  meeting_url text,
  meeting_id text,
  passcode text,
  created_at timestamptz not null default now()
);

create table if not exists public.class_announcements (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.private_classes(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  title text not null,
  content text not null,
  is_pinned boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_rooms (
  id uuid primary key default gen_random_uuid(),
  room_type text not null check (room_type in ('direct','class')),
  class_id uuid references public.private_classes(id) on delete cascade,
  title text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_room_members (
  room_id uuid not null references public.chat_rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  member_role text not null default 'member' check (member_role in ('owner','moderator','member')),
  muted_until timestamptz,
  blocked_at timestamptz,
  last_read_at timestamptz,
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.chat_rooms(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  reply_to_id uuid references public.chat_messages(id),
  content text check (content is null or char_length(content) between 1 and 4000),
  message_type text not null default 'text' check (message_type in ('text','attachment','system')),
  is_pinned boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.chat_messages(id) on delete cascade,
  storage_path text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 10485760),
  created_at timestamptz not null default now()
);

create or replace function private.is_room_member(target_room uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.chat_room_members
    where room_id = target_room
      and user_id = (select auth.uid())
      and blocked_at is null
  );
$$;
revoke all on function private.is_room_member(uuid) from public, anon;
grant execute on function private.is_room_member(uuid) to authenticated;

create table if not exists public.live_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  asatidz_id uuid references public.asatidz_profiles(id),
  description text,
  provider text not null check (provider in ('youtube','zoom','external')),
  starts_at timestamptz not null,
  timezone text not null default 'Asia/Jakarta',
  estimated_minutes integer check (estimated_minutes is null or estimated_minutes between 10 and 720),
  event_url text not null,
  passcode text,
  thumbnail_url text,
  visibility text not null default 'public' check (visibility in ('public','members')),
  status text not null default 'scheduled' check (status in ('scheduled','live','ended','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.donation_programs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text not null check (category in ('wakaf_quran','infaq_asatidz','sedekah','other')),
  description text,
  target_amount numeric(16,2),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.donation_transactions (
  id uuid primary key default gen_random_uuid(),
  transaction_code text not null unique,
  program_id uuid not null references public.donation_programs(id),
  donor_id uuid references public.profiles(id),
  amount numeric(16,2) not null check (amount >= 10000),
  payment_method text not null,
  status text not null default 'PENDING_VERIFICATION'
    check (status in ('PENDING_VERIFICATION','APPROVED','REJECTED','CANCELLED')),
  idempotency_key text unique,
  reviewed_by uuid references auth.users(id),
  review_reason text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.donation_proofs (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.donation_transactions(id) on delete cascade,
  storage_path text not null,
  file_hash text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 5242880),
  uploaded_at timestamptz not null default now()
);

create table if not exists public.fees (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null references public.materials(id),
  asatidz_id uuid not null references public.asatidz_profiles(id),
  amount numeric(16,2) not null check (amount >= 0),
  currency char(3) not null default 'IDR',
  note text,
  status text not null default 'approved' check (status in ('approved','payable','paid','reversed')),
  decided_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.payouts (
  id uuid primary key default gen_random_uuid(),
  asatidz_id uuid not null references public.asatidz_profiles(id),
  total_amount numeric(16,2) not null check (total_amount >= 0),
  currency char(3) not null default 'IDR',
  status text not null default 'DRAFT' check (status in ('DRAFT','PENDING','PAID','FAILED','CANCELLED')),
  created_by uuid not null references auth.users(id),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.payout_items (
  payout_id uuid not null references public.payouts(id) on delete cascade,
  fee_id uuid not null references public.fees(id),
  amount numeric(16,2) not null check (amount >= 0),
  primary key (payout_id, fee_id)
);

create table if not exists public.payout_proofs (
  id uuid primary key default gen_random_uuid(),
  payout_id uuid not null references public.payouts(id) on delete cascade,
  storage_path text not null,
  file_hash text not null,
  uploaded_by uuid not null references auth.users(id),
  uploaded_at timestamptz not null default now()
);

create table if not exists public.prayer_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  sort_order integer not null default 0
);

create table if not exists public.daily_prayers (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.prayer_categories(id),
  title text not null,
  arabic_text text not null,
  transliteration text,
  translation text not null,
  virtue text,
  reference text,
  audio_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.dhikr_items (
  id uuid primary key default gen_random_uuid(),
  period text not null check (period in ('morning','evening','general')),
  title text not null,
  arabic_text text not null,
  transliteration text,
  translation text not null,
  repetitions integer not null default 1 check (repetitions > 0),
  reference text,
  sort_order integer not null default 0,
  is_published boolean not null default false
);

create table if not exists public.bahtsul_topics (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id),
  title text not null,
  content text not null,
  category text,
  status text not null default 'open' check (status in ('open','answered','closed','hidden')),
  created_at timestamptz not null default now()
);

create table if not exists public.bahtsul_answers (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.bahtsul_topics(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  content text not null,
  is_official boolean not null default false,
  revision integer not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.muamalat_topics (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id),
  title text not null,
  content text not null,
  category text,
  status text not null default 'open' check (status in ('open','answered','closed','hidden')),
  created_at timestamptz not null default now()
);

create table if not exists public.muamalat_answers (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.muamalat_topics(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  content text not null,
  is_official boolean not null default false,
  revision integer not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  source text,
  author_id uuid references public.profiles(id),
  is_published boolean not null default false,
  publish_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.retrospectives (
  id uuid primary key default gen_random_uuid(),
  asatidz_id uuid references public.asatidz_profiles(id),
  title text not null,
  summary text,
  event_date date,
  cover_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  description text not null,
  icon text,
  target_role text check (target_role is null or target_role in ('admin','siswa','asatidz')),
  is_active boolean not null default true
);

create table if not exists public.user_achievements (
  user_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  awarded_by uuid references auth.users(id),
  awarded_at timestamptz not null default now(),
  evidence jsonb not null default '{}'::jsonb,
  primary key (user_id, achievement_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id),
  subject_type text not null,
  subject_id uuid not null,
  reason text not null,
  details text,
  status text not null default 'open' check (status in ('open','investigating','resolved','dismissed')),
  created_at timestamptz not null default now()
);

create table if not exists public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references public.reports(id),
  moderator_id uuid not null references auth.users(id),
  action text not null,
  reason text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  request_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.idempotency_keys (
  key text primary key,
  owner_id uuid references auth.users(id),
  scope text not null,
  request_hash text not null,
  response_status integer,
  response_body jsonb,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.background_jobs (
  id uuid primary key default gen_random_uuid(),
  job_type text not null,
  payload jsonb not null,
  status text not null default 'queued' check (status in ('queued','running','succeeded','failed','cancelled')),
  attempts integer not null default 0,
  max_attempts integer not null default 3,
  run_after timestamptz not null default now(),
  locked_at timestamptz,
  finished_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);

create index if not exists materials_workflow_status_idx on public.materials(workflow_status, created_at desc);
create index if not exists quran_sessions_user_created_idx on public.quran_sessions(user_id, created_at desc);
create index if not exists chat_messages_room_created_idx on public.chat_messages(room_id, created_at desc) where deleted_at is null;
create index if not exists donation_transactions_status_created_idx on public.donation_transactions(status, created_at desc);
create index if not exists background_jobs_ready_idx on public.background_jobs(status, run_after) where status = 'queued';
create index if not exists audit_logs_entity_idx on public.audit_logs(entity_type, entity_id, created_at desc);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'user_roles','student_profiles','asatidz_documents','expertise_tags','asatidz_expertise',
    'material_versions','material_reviews','quiz_options','quiz_answers','quran_practice_segments',
    'private_classes','class_members','class_sessions','class_announcements',
    'chat_rooms','chat_room_members','chat_messages','chat_attachments','live_events',
    'donation_programs','donation_transactions','donation_proofs','fees','payouts','payout_items','payout_proofs',
    'prayer_categories','daily_prayers','dhikr_items','bahtsul_topics','bahtsul_answers',
    'muamalat_topics','muamalat_answers','quotes','retrospectives','achievements','user_achievements',
    'reports','moderation_actions','audit_logs','idempotency_keys','background_jobs'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = table_name and policyname = 'admin_full_access'
    ) then
      execute format(
        'create policy admin_full_access on public.%I for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()))',
        table_name
      );
    end if;
  end loop;
end $$;

create policy student_profiles_own_select on public.student_profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy student_profiles_own_insert on public.student_profiles
  for insert to authenticated with check ((select auth.uid()) = id);
create policy student_profiles_own_update on public.student_profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy expertise_tags_public_read on public.expertise_tags
  for select to anon, authenticated using (is_active = true);
create policy donation_programs_public_read on public.donation_programs
  for select to anon, authenticated using (is_active = true);
create policy daily_prayers_public_read on public.daily_prayers
  for select to anon, authenticated using (is_published = true);
create policy dhikr_items_public_read on public.dhikr_items
  for select to anon, authenticated using (is_published = true);
create policy quotes_public_read on public.quotes
  for select to anon, authenticated using (is_published = true);
create policy retrospectives_public_read on public.retrospectives
  for select to anon, authenticated using (is_published = true);
create policy achievements_public_read on public.achievements
  for select to anon, authenticated using (is_active = true);
create policy live_events_public_read on public.live_events
  for select to anon, authenticated using (visibility = 'public' and status <> 'cancelled');

create policy quran_segments_own_read on public.quran_practice_segments
  for select to authenticated using (
    exists (
      select 1 from public.quran_sessions
      where quran_sessions.id = quran_practice_segments.session_id
        and quran_sessions.user_id = (select auth.uid())
    )
  );
create policy quran_segments_own_insert on public.quran_practice_segments
  for insert to authenticated with check (
    exists (
      select 1 from public.quran_sessions
      where quran_sessions.id = quran_practice_segments.session_id
        and quran_sessions.user_id = (select auth.uid())
    )
  );

create policy chat_rooms_member_read on public.chat_rooms
  for select to authenticated using ((select private.is_room_member(id)));
create policy chat_members_member_read on public.chat_room_members
  for select to authenticated using ((select private.is_room_member(room_id)));
create policy chat_messages_member_read on public.chat_messages
  for select to authenticated using ((select private.is_room_member(room_id)));
create policy chat_messages_member_insert on public.chat_messages
  for insert to authenticated with check (
    sender_id = (select auth.uid()) and (select private.is_room_member(room_id))
  );
create policy chat_attachments_member_read on public.chat_attachments
  for select to authenticated using (
    exists (
      select 1 from public.chat_messages
      where chat_messages.id = chat_attachments.message_id
        and (select private.is_room_member(chat_messages.room_id))
    )
  );

create policy donation_transactions_own_read on public.donation_transactions
  for select to authenticated using (donor_id = (select auth.uid()));
create policy donation_transactions_own_insert on public.donation_transactions
  for insert to authenticated with check (donor_id = (select auth.uid()));
create policy donation_proofs_own_read on public.donation_proofs
  for select to authenticated using (
    exists (
      select 1 from public.donation_transactions
      where donation_transactions.id = donation_proofs.transaction_id
        and donation_transactions.donor_id = (select auth.uid())
    )
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('public-media', 'public-media', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('asatidz-private', 'asatidz-private', false, 10485760, array['application/pdf','image/jpeg','image/png']),
  ('financial-proofs', 'financial-proofs', false, 5242880, array['image/jpeg','image/png','application/pdf']),
  ('chat-private', 'chat-private', false, 10485760, array['image/jpeg','image/png','application/pdf','audio/m4a','audio/webm'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

grant select on public.expertise_tags, public.donation_programs, public.daily_prayers,
  public.dhikr_items, public.quotes, public.retrospectives, public.achievements, public.live_events
  to anon, authenticated;
grant select, insert, update on public.student_profiles to authenticated;
grant select, insert on public.quran_practice_segments, public.chat_messages,
  public.donation_transactions, public.donation_proofs to authenticated;
grant select on public.chat_rooms, public.chat_room_members, public.chat_attachments to authenticated;

commit;
