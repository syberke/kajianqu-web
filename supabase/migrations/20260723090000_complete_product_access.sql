begin;

create or replace function private.is_approved_asatidz()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles profile
    join public.asatidz_profiles asatidz on asatidz.id = profile.id
    where profile.id = (select auth.uid())
      and profile.role = 'asatidz'
      and profile.is_active = true
      and asatidz.approved = true
      and asatidz.status = 'APPROVED'
  );
$$;

create or replace function private.owns_class(target_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.private_classes class
    where class.id = target_class_id
      and class.asatidz_id = (select auth.uid())
      and (select private.is_approved_asatidz())
  );
$$;

create or replace function private.is_active_class_member(target_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.class_members member
    where member.class_id = target_class_id
      and member.user_id = (select auth.uid())
      and member.status = 'active'
  );
$$;

create or replace function private.own_asatidz_review_state_unchanged(
  target_id uuid,
  next_approved boolean,
  next_status text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.asatidz_profiles current_profile
    where current_profile.id = target_id
      and current_profile.id = (select auth.uid())
      and current_profile.approved is not distinct from next_approved
      and current_profile.status is not distinct from next_status
  );
$$;

revoke all on function private.is_approved_asatidz() from public, anon;
revoke all on function private.owns_class(uuid) from public, anon;
revoke all on function private.is_active_class_member(uuid) from public, anon;
revoke all on function private.own_asatidz_review_state_unchanged(uuid, boolean, text) from public, anon;
grant execute on function private.is_approved_asatidz() to authenticated;
grant execute on function private.owns_class(uuid) to authenticated;
grant execute on function private.is_active_class_member(uuid) to authenticated;
grant execute on function private.own_asatidz_review_state_unchanged(uuid, boolean, text) to authenticated;

create or replace function private.handle_new_kajianku_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_role text;
  display_name text;
begin
  requested_role := case
    when new.raw_user_meta_data ->> 'role' in ('siswa', 'asatidz')
      then new.raw_user_meta_data ->> 'role'
    else 'siswa'
  end;
  display_name := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'nama'), ''),
    split_part(coalesce(new.email, 'Sahabat KajianQu'), '@', 1)
  );

  insert into public.profiles (id, role, nama, email, is_active)
  values (new.id, requested_role, display_name, new.email, true)
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, requested_role)
  on conflict (user_id, role) do nothing;

  if requested_role = 'asatidz' then
    insert into public.asatidz_profiles (id, approved, status)
    values (new.id, false, 'PENDING_PROFILE')
    on conflict (id) do nothing;
  else
    insert into public.student_profiles (id)
    values (new.id)
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_kajianku on auth.users;
create trigger on_auth_user_created_kajianku
  after insert on auth.users
  for each row execute function private.handle_new_kajianku_user();

drop policy if exists profiles_own_update on public.profiles;
create policy profiles_own_update on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists user_roles_own_select on public.user_roles;
create policy user_roles_own_select on public.user_roles
  for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));

drop policy if exists asatidz_profile_own_insert on public.asatidz_profiles;
create policy asatidz_profile_own_insert on public.asatidz_profiles
  for insert to authenticated
  with check (
    (select auth.uid()) = id
    and approved = false
    and status = 'PENDING_PROFILE'
  );

drop policy if exists asatidz_profile_own_update on public.asatidz_profiles;
create policy asatidz_profile_own_update on public.asatidz_profiles
  for update to authenticated
  using ((select auth.uid()) = id or (select private.is_admin()))
  with check (
    (select private.is_admin())
    or (
      (select auth.uid()) = id
      and (select private.own_asatidz_review_state_unchanged(id, approved, status))
    )
  );

create or replace function public.list_public_asatidz()
returns table (
  id uuid,
  nama text,
  foto_url text,
  title text,
  bidang text,
  bio text,
  teaching_area text,
  memorization_juz numeric
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    profile.id,
    profile.nama,
    profile.foto_url,
    asatidz.title,
    asatidz.bidang,
    asatidz.bio,
    asatidz.teaching_area,
    asatidz.memorization_juz
  from public.profiles profile
  join public.asatidz_profiles asatidz on asatidz.id = profile.id
  where profile.role = 'asatidz'
    and profile.is_active = true
    and asatidz.approved = true
    and asatidz.status = 'APPROVED'
  order by profile.nama;
$$;
revoke all on function public.list_public_asatidz() from public;
grant execute on function public.list_public_asatidz() to anon, authenticated;

drop policy if exists materials_asatidz_insert on public.materials;
drop policy if exists materials_asatidz_update on public.materials;
drop policy if exists materials_asatidz_delete on public.materials;
create policy materials_asatidz_insert on public.materials
  for insert to authenticated
  with check (
    (select private.is_admin())
    or (
      asatidz_id = (select auth.uid())
      and (select private.is_approved_asatidz())
      and workflow_status in ('DRAFT', 'SUBMITTED')
      and is_published = false
    )
  );
create policy materials_asatidz_update on public.materials
  for update to authenticated
  using (
    (select private.is_admin())
    or (
      asatidz_id = (select auth.uid())
      and (select private.is_approved_asatidz())
      and workflow_status not in ('PUBLISHED', 'ARCHIVED')
    )
  )
  with check (
    (select private.is_admin())
    or (
      asatidz_id = (select auth.uid())
      and workflow_status in ('DRAFT', 'SUBMITTED', 'REVISION_REQUIRED')
      and is_published = false
    )
  );
create policy materials_asatidz_delete on public.materials
  for delete to authenticated
  using (
    (select private.is_admin())
    or (
      asatidz_id = (select auth.uid())
      and workflow_status in ('DRAFT', 'REJECTED')
    )
  );

drop policy if exists admin_full_access on public.private_classes;
create policy private_classes_public_read on public.private_classes
  for select to anon using (registration_status in ('open', 'ongoing'));
create policy private_classes_authenticated_read on public.private_classes
  for select to authenticated using (
    registration_status in ('open', 'ongoing')
    or asatidz_id = (select auth.uid())
    or (select private.is_active_class_member(id))
    or (select private.is_admin())
  );
create policy private_classes_owner_insert on public.private_classes
  for insert to authenticated with check (
    (select private.is_admin())
    or (asatidz_id = (select auth.uid()) and (select private.is_approved_asatidz()))
  );
create policy private_classes_owner_update on public.private_classes
  for update to authenticated
  using ((select private.is_admin()) or (select private.owns_class(id)))
  with check ((select private.is_admin()) or asatidz_id = (select auth.uid()));
create policy private_classes_owner_delete on public.private_classes
  for delete to authenticated
  using ((select private.is_admin()) or (select private.owns_class(id)));

drop policy if exists admin_full_access on public.class_members;
create policy class_members_visible on public.class_members
  for select to authenticated using (
    user_id = (select auth.uid())
    or (select private.owns_class(class_id))
    or (select private.is_admin())
  );
create policy class_members_join on public.class_members
  for insert to authenticated with check (
    (
      user_id = (select auth.uid())
      and status = 'pending'
      and exists (
        select 1 from public.private_classes class
        where class.id = class_members.class_id
          and class.registration_status = 'open'
      )
    )
    or (select private.owns_class(class_id))
    or (select private.is_admin())
  );
create policy class_members_manage on public.class_members
  for update to authenticated
  using (
    user_id = (select auth.uid())
    or (select private.owns_class(class_id))
    or (select private.is_admin())
  )
  with check (
    (user_id = (select auth.uid()) and status = 'cancelled')
    or (select private.owns_class(class_id))
    or (select private.is_admin())
  );
create policy class_members_remove on public.class_members
  for delete to authenticated
  using (
    user_id = (select auth.uid())
    or (select private.owns_class(class_id))
    or (select private.is_admin())
  );

drop policy if exists admin_full_access on public.class_sessions;
create policy class_sessions_visible on public.class_sessions
  for select to authenticated using (
    (select private.owns_class(class_id))
    or (select private.is_active_class_member(class_id))
    or (select private.is_admin())
  );
create policy class_sessions_owner_insert on public.class_sessions
  for insert to authenticated with check (
    (select private.owns_class(class_id)) or (select private.is_admin())
  );
create policy class_sessions_owner_update on public.class_sessions
  for update to authenticated
  using ((select private.owns_class(class_id)) or (select private.is_admin()))
  with check ((select private.owns_class(class_id)) or (select private.is_admin()));
create policy class_sessions_owner_delete on public.class_sessions
  for delete to authenticated
  using ((select private.owns_class(class_id)) or (select private.is_admin()));

drop policy if exists quran_sessions_own_insert on public.quran_sessions;
drop policy if exists quran_sessions_own_update on public.quran_sessions;
create policy quran_sessions_own_insert on public.quran_sessions
  for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy quran_sessions_own_update on public.quran_sessions
  for update to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()))
  with check (user_id = (select auth.uid()) or (select private.is_admin()));

drop policy if exists live_events_authenticated_read on public.live_events;
drop policy if exists admin_insert on public.live_events;
drop policy if exists admin_update on public.live_events;
drop policy if exists admin_delete on public.live_events;
create policy live_events_authenticated_read on public.live_events
  for select to authenticated using (
    (visibility = 'public' and status <> 'cancelled')
    or asatidz_id = (select auth.uid())
    or (select private.is_admin())
  );
create policy live_events_owner_insert on public.live_events
  for insert to authenticated with check (
    (select private.is_admin())
    or (asatidz_id = (select auth.uid()) and (select private.is_approved_asatidz()))
  );
create policy live_events_owner_update on public.live_events
  for update to authenticated
  using (
    (select private.is_admin())
    or (asatidz_id = (select auth.uid()) and (select private.is_approved_asatidz()))
  )
  with check (
    (select private.is_admin())
    or (asatidz_id = (select auth.uid()) and provider in ('youtube', 'zoom', 'external'))
  );
create policy live_events_owner_delete on public.live_events
  for delete to authenticated
  using ((select private.is_admin()) or asatidz_id = (select auth.uid()));

create or replace function public.ensure_class_chat(target_class_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid;
  room_id uuid;
begin
  current_user_id := (select auth.uid());
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;
  if not (
    (select private.is_admin())
    or (select private.owns_class(target_class_id))
    or (select private.is_active_class_member(target_class_id))
  ) then
    raise exception 'Not a class member';
  end if;

  select room.id into room_id
  from public.chat_rooms room
  where room.class_id = target_class_id and room.room_type = 'class'
  limit 1;

  if room_id is null then
    insert into public.chat_rooms (room_type, class_id, title, created_by)
    select 'class', class.id, class.title, current_user_id
    from public.private_classes class
    where class.id = target_class_id
    returning id into room_id;
  end if;

  insert into public.chat_room_members (room_id, user_id, member_role)
  values (
    room_id,
    current_user_id,
    case when (select private.owns_class(target_class_id)) then 'moderator' else 'member' end
  )
  on conflict (room_id, user_id) do nothing;

  return room_id;
end;
$$;
revoke all on function public.ensure_class_chat(uuid) from public, anon;
grant execute on function public.ensure_class_chat(uuid) to authenticated;

create or replace function public.create_donation_transaction(
  target_program_id uuid,
  donation_amount numeric,
  selected_payment_method text,
  request_idempotency_key text
)
returns table (
  id uuid,
  transaction_code text,
  status text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid;
begin
  current_user_id := (select auth.uid());
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;
  if donation_amount < 10000 then
    raise exception 'Minimum donation is 10000';
  end if;
  if selected_payment_method not in ('bank_transfer', 'qris', 'ewallet') then
    raise exception 'Unsupported payment method';
  end if;
  if char_length(request_idempotency_key) < 16 or char_length(request_idempotency_key) > 128 then
    raise exception 'Invalid idempotency key';
  end if;
  if not exists (
    select 1 from public.donation_programs program
    where program.id = target_program_id and program.is_active = true
  ) then
    raise exception 'Donation program is not active';
  end if;

  return query
  select existing.id, existing.transaction_code, existing.status
  from public.donation_transactions existing
  where existing.idempotency_key = request_idempotency_key
    and existing.donor_id = current_user_id;
  if found then
    return;
  end if;

  return query
  insert into public.donation_transactions (
    transaction_code,
    program_id,
    donor_id,
    amount,
    payment_method,
    status,
    idempotency_key
  )
  values (
    'KQ-' || to_char(clock_timestamp(), 'YYYYMMDD') || '-' ||
      upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
    target_program_id,
    current_user_id,
    donation_amount,
    selected_payment_method,
    'PENDING_VERIFICATION',
    request_idempotency_key
  )
  returning
    donation_transactions.id,
    donation_transactions.transaction_code,
    donation_transactions.status;
end;
$$;
revoke all on function public.create_donation_transaction(uuid, numeric, text, text) from public, anon;
grant execute on function public.create_donation_transaction(uuid, numeric, text, text) to authenticated;

do $$
declare
  topic_table text;
  answer_table text;
begin
  foreach topic_table in array array['bahtsul_topics', 'muamalat_topics']
  loop
    execute format('drop policy if exists admin_full_access on public.%I', topic_table);
    execute format(
      'create policy public_read on public.%I for select to anon using (status <> ''hidden'')',
      topic_table
    );
    execute format(
      'create policy authenticated_read on public.%I for select to authenticated using (status <> ''hidden'' or (select private.is_admin()))',
      topic_table
    );
    execute format(
      'create policy author_insert on public.%I for insert to authenticated with check (author_id = (select auth.uid()) and status = ''open'')',
      topic_table
    );
    execute format(
      'create policy author_update on public.%I for update to authenticated using (author_id = (select auth.uid()) or (select private.is_admin())) with check (author_id = (select auth.uid()) or (select private.is_admin()))',
      topic_table
    );
    execute format(
      'create policy author_delete on public.%I for delete to authenticated using ((author_id = (select auth.uid()) and status = ''open'') or (select private.is_admin()))',
      topic_table
    );
  end loop;

  foreach answer_table in array array['bahtsul_answers', 'muamalat_answers']
  loop
    execute format('drop policy if exists admin_full_access on public.%I', answer_table);
    execute format(
      'create policy public_read on public.%I for select to anon, authenticated using (true)',
      answer_table
    );
    execute format(
      'create policy author_insert on public.%I for insert to authenticated with check (author_id = (select auth.uid()) and (is_official = false or (select private.is_approved_asatidz()) or (select private.is_admin())))',
      answer_table
    );
    execute format(
      'create policy author_update on public.%I for update to authenticated using (author_id = (select auth.uid()) or (select private.is_admin())) with check ((author_id = (select auth.uid()) and (is_official = false or (select private.is_approved_asatidz()))) or (select private.is_admin()))',
      answer_table
    );
    execute format(
      'create policy author_delete on public.%I for delete to authenticated using (author_id = (select auth.uid()) or (select private.is_admin()))',
      answer_table
    );
  end loop;
end $$;

grant select, update (nama, no_wa, foto_url) on public.profiles to authenticated;
grant select on public.user_roles to authenticated;
grant select, insert, update on public.asatidz_profiles to authenticated;
grant select, insert, update, delete on public.materials to authenticated;
grant select on public.private_classes to anon;
grant select, insert, update, delete on public.private_classes to authenticated;
grant select, insert, update, delete on public.class_members to authenticated;
grant select, insert, update, delete on public.class_sessions to authenticated;
grant select, insert, update on public.quran_sessions to authenticated;
grant select, insert, update, delete on public.live_events to authenticated;
grant select on public.bahtsul_topics, public.bahtsul_answers,
  public.muamalat_topics, public.muamalat_answers to anon, authenticated;
grant insert, update, delete on public.bahtsul_topics, public.bahtsul_answers,
  public.muamalat_topics, public.muamalat_answers to authenticated;

commit;
