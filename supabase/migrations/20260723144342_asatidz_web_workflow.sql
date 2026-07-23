-- Applied to project zqubndojitbslbbblllo as migration 20260723144342.
begin;

alter table public.asatidz_profiles
  add column if not exists bank_account_type text,
  add column if not exists review_note text,
  add column if not exists submitted_at timestamptz,
  add column if not exists reviewed_by uuid references auth.users(id),
  add column if not exists reviewed_at timestamptz;

create sequence if not exists public.asatidz_code_seq;

create or replace function private.assign_asatidz_code()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.asatidz_code is null or btrim(new.asatidz_code) = '' then
    new.asatidz_code :=
      'KQ-ASZ-' || to_char(current_date, 'YYYY') || '-' ||
      lpad(nextval('public.asatidz_code_seq')::text, 6, '0');
  end if;
  return new;
end;
$$;

revoke all on function private.assign_asatidz_code() from public, anon, authenticated;

drop trigger if exists assign_asatidz_code_before_write on public.asatidz_profiles;
create trigger assign_asatidz_code_before_write
  before insert or update of asatidz_code on public.asatidz_profiles
  for each row execute function private.assign_asatidz_code();

update public.asatidz_profiles
set asatidz_code = null
where asatidz_code is null;

create index if not exists asatidz_profiles_status_submitted_idx
  on public.asatidz_profiles(status, submitted_at desc);

alter table public.materials
  add column if not exists duration_minutes integer;

update public.materials
set duration_minutes = 30
where youtube_url is not null
  and duration_minutes is null;

alter table public.materials
  drop constraint if exists materials_duration_minutes_check;
alter table public.materials
  add constraint materials_duration_minutes_check
  check (
    duration_minutes is null
    or duration_minutes between 1 and 720
  );

alter table public.materials
  drop constraint if exists materials_video_minimum_duration_check;
alter table public.materials
  add constraint materials_video_minimum_duration_check
  check (
    youtube_url is null
    or duration_minutes >= 30
  );

create unique index if not exists fees_one_per_material_uq
  on public.fees(material_id);

alter table public.donations
  add column if not exists idempotency_key text;
create unique index if not exists donations_idempotency_key_uq
  on public.donations(idempotency_key)
  where idempotency_key is not null;

create or replace function public.submit_asatidz_application()
returns table (status text, submitted_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  missing_fields text[] := '{}';
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1
    from public.profiles profile
    where profile.id = current_user_id
      and profile.role = 'asatidz'
      and profile.is_active = true
  ) then
    raise exception 'Asatidz account required';
  end if;

  if not exists (
    select 1
    from public.profiles profile
    join public.asatidz_profiles asatidz on asatidz.id = profile.id
    where profile.id = current_user_id
      and nullif(btrim(profile.nama), '') is not null
      and nullif(btrim(profile.email), '') is not null
      and nullif(btrim(profile.no_wa), '') is not null
      and nullif(btrim(asatidz.bank), '') is not null
      and nullif(btrim(asatidz.no_rekening), '') is not null
      and nullif(btrim(asatidz.bank_account_name), '') is not null
      and nullif(btrim(asatidz.formal_education), '') is not null
      and nullif(btrim(asatidz.pengalaman_mengajar), '') is not null
      and asatidz.memorization_juz is not null
  ) then
    missing_fields := array_append(missing_fields, 'profil_wajib');
  end if;

  if not exists (
    select 1 from public.asatidz_expertise expertise
    where expertise.asatidz_id = current_user_id
  ) then
    missing_fields := array_append(missing_fields, 'keilmuan');
  end if;

  if not exists (
    select 1 from public.asatidz_documents document
    where document.asatidz_id = current_user_id
      and document.document_type = 'cv'
  ) then
    missing_fields := array_append(missing_fields, 'cv');
  end if;

  if cardinality(missing_fields) > 0 then
    raise exception 'Application incomplete: %', array_to_string(missing_fields, ',');
  end if;

  update public.asatidz_profiles
  set
    status = 'PENDING_REVIEW',
    approved = false,
    review_note = null,
    submitted_at = now(),
    reviewed_by = null,
    reviewed_at = null,
    updated_at = now()
  where id = current_user_id
    and status in ('PENDING_PROFILE', 'REVISION_REQUIRED', 'REJECTED');

  return query
  select asatidz.status, asatidz.submitted_at
  from public.asatidz_profiles asatidz
  where asatidz.id = current_user_id;
end;
$$;

revoke all on function public.submit_asatidz_application() from public, anon;
grant execute on function public.submit_asatidz_application() to authenticated;

drop policy if exists asatidz_documents_own_read on public.asatidz_documents;
create policy asatidz_documents_own_read on public.asatidz_documents
  for select to authenticated
  using (
    asatidz_id = (select auth.uid())
    or (select private.is_admin())
  );

drop policy if exists asatidz_documents_own_insert on public.asatidz_documents;
create policy asatidz_documents_own_insert on public.asatidz_documents
  for insert to authenticated
  with check (
    asatidz_id = (select auth.uid())
    and status = 'pending'
    and reviewed_by is null
    and reviewed_at is null
  );

drop policy if exists asatidz_documents_own_delete on public.asatidz_documents;
create policy asatidz_documents_own_delete on public.asatidz_documents
  for delete to authenticated
  using (
    (
      asatidz_id = (select auth.uid())
      and status in ('pending', 'rejected')
      and exists (
        select 1 from public.asatidz_profiles application
        where application.id = asatidz_documents.asatidz_id
          and application.status in ('PENDING_PROFILE', 'REVISION_REQUIRED', 'REJECTED')
      )
    )
    or (select private.is_admin())
  );

drop policy if exists asatidz_expertise_own_read on public.asatidz_expertise;
create policy asatidz_expertise_own_read on public.asatidz_expertise
  for select to authenticated
  using (
    asatidz_id = (select auth.uid())
    or (select private.is_admin())
  );

drop policy if exists asatidz_expertise_own_insert on public.asatidz_expertise;
create policy asatidz_expertise_own_insert on public.asatidz_expertise
  for insert to authenticated
  with check (
    asatidz_id = (select auth.uid())
    and exists (
      select 1 from public.expertise_tags tag
      where tag.id = asatidz_expertise.tag_id
        and tag.is_active = true
    )
  );

drop policy if exists asatidz_expertise_own_delete on public.asatidz_expertise;
create policy asatidz_expertise_own_delete on public.asatidz_expertise
  for delete to authenticated
  using (
    asatidz_id = (select auth.uid())
    or (select private.is_admin())
  );

drop policy if exists fees_asatidz_read on public.fees;
create policy fees_asatidz_read on public.fees
  for select to authenticated
  using (
    asatidz_id = (select auth.uid())
    or (select private.is_admin())
  );

drop policy if exists payouts_asatidz_read on public.payouts;
create policy payouts_asatidz_read on public.payouts
  for select to authenticated
  using (
    asatidz_id = (select auth.uid())
    or (select private.is_admin())
  );

drop policy if exists payout_items_asatidz_read on public.payout_items;
create policy payout_items_asatidz_read on public.payout_items
  for select to authenticated
  using (
    exists (
      select 1 from public.payouts payout
      where payout.id = payout_items.payout_id
        and (
          payout.asatidz_id = (select auth.uid())
          or (select private.is_admin())
        )
    )
  );

drop policy if exists payout_proofs_asatidz_read on public.payout_proofs;
create policy payout_proofs_asatidz_read on public.payout_proofs
  for select to authenticated
  using (
    exists (
      select 1 from public.payouts payout
      where payout.id = payout_proofs.payout_id
        and (
          payout.asatidz_id = (select auth.uid())
          or (select private.is_admin())
        )
    )
  );

drop policy if exists asatidz_private_owner_select on storage.objects;
create policy asatidz_private_owner_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'asatidz-private'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or (select private.is_admin())
    )
  );

drop policy if exists asatidz_private_owner_insert on storage.objects;
create policy asatidz_private_owner_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'asatidz-private'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists asatidz_private_owner_delete on storage.objects;
create policy asatidz_private_owner_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'asatidz-private'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or (select private.is_admin())
    )
  );

drop policy if exists financial_proofs_participant_select on storage.objects;
create policy financial_proofs_participant_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'financial-proofs'
    and (
      (select private.is_admin())
      or (storage.foldername(name))[2] = (select auth.uid())::text
    )
  );

drop policy if exists financial_proofs_admin_insert on storage.objects;
create policy financial_proofs_admin_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'financial-proofs'
    and (select private.is_admin())
  );

drop policy if exists financial_proofs_admin_update on storage.objects;
create policy financial_proofs_admin_update on storage.objects
  for update to authenticated
  using (bucket_id = 'financial-proofs' and (select private.is_admin()))
  with check (bucket_id = 'financial-proofs' and (select private.is_admin()));

drop policy if exists financial_proofs_admin_delete on storage.objects;
create policy financial_proofs_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'financial-proofs' and (select private.is_admin()));

create or replace function private.can_moderate_room(target_room uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.chat_room_members member
    where member.room_id = target_room
      and member.user_id = (select auth.uid())
      and member.member_role in ('owner', 'moderator')
      and member.blocked_at is null
  ) or (select private.is_admin());
$$;

revoke all on function private.can_moderate_room(uuid) from public, anon;
grant execute on function private.can_moderate_room(uuid) to authenticated;

drop policy if exists chat_messages_moderator_update on public.chat_messages;
create policy chat_messages_moderator_update on public.chat_messages
  for update to authenticated
  using ((select private.can_moderate_room(room_id)))
  with check ((select private.can_moderate_room(room_id)));

drop policy if exists chat_rooms_owner_insert on public.chat_rooms;
create policy chat_rooms_owner_insert on public.chat_rooms
  for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and room_type = 'class'
    and class_id is not null
    and (select private.owns_class(class_id))
  );

drop policy if exists chat_room_members_owner_insert on public.chat_room_members;
create policy chat_room_members_owner_insert on public.chat_room_members
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    or exists (
      select 1
      from public.chat_rooms room
      where room.id = chat_room_members.room_id
        and room.class_id is not null
        and (select private.owns_class(room.class_id))
    )
    or (select private.is_admin())
  );

drop policy if exists user_achievements_own_read on public.user_achievements;
create policy user_achievements_own_read on public.user_achievements
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or (select private.is_admin())
  );

grant select, insert, delete on public.asatidz_documents to authenticated;
grant select, insert, delete on public.asatidz_expertise to authenticated;
grant select on public.fees, public.payouts, public.payout_items, public.payout_proofs to authenticated;
grant select on public.user_achievements to authenticated;

commit;
