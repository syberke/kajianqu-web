-- Applied to project zqubndojitbslbbblllo as migration 20260723144534.
begin;

create index if not exists asatidz_profiles_reviewed_by_idx
  on public.asatidz_profiles(reviewed_by)
  where reviewed_by is not null;

-- Submission is handled by the authenticated server route with an exact owner
-- check, so the state-changing SECURITY DEFINER RPC no longer needs exposure.
revoke all on function public.submit_asatidz_application() from public, anon, authenticated;
drop function if exists public.submit_asatidz_application();

-- The policies below already include the admin branch. Removing the generic
-- policy avoids evaluating two permissive policies for every request.
drop policy if exists admin_full_access on public.asatidz_documents;
drop policy if exists admin_full_access on public.asatidz_expertise;
drop policy if exists admin_full_access on public.fees;
drop policy if exists admin_full_access on public.payouts;
drop policy if exists admin_full_access on public.payout_items;
drop policy if exists admin_full_access on public.payout_proofs;
drop policy if exists admin_full_access on public.user_achievements;

drop policy if exists admin_update on public.chat_messages;

drop policy if exists chat_rooms_admin_insert on public.chat_rooms;
drop policy if exists chat_rooms_owner_insert on public.chat_rooms;
create policy chat_rooms_owner_or_admin_insert on public.chat_rooms
  for insert to authenticated
  with check (
    (select private.is_admin())
    or (
      created_by = (select auth.uid())
      and room_type = 'class'
      and class_id is not null
      and (select private.owns_class(class_id))
    )
  );

drop policy if exists chat_room_members_admin_insert on public.chat_room_members;
drop policy if exists chat_room_members_owner_insert on public.chat_room_members;
create policy chat_room_members_owner_or_admin_insert on public.chat_room_members
  for insert to authenticated
  with check (
    (select private.is_admin())
    or user_id = (select auth.uid())
    or exists (
      select 1
      from public.chat_rooms room
      where room.id = chat_room_members.room_id
        and room.class_id is not null
        and (select private.owns_class(room.class_id))
    )
  );

commit;
