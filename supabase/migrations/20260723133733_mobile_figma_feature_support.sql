begin;

create or replace function public.ensure_direct_chat(target_asatidz_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  room_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if current_user_id = target_asatidz_id then
    raise exception 'Cannot create a direct chat with yourself';
  end if;

  if not exists (
    select 1
    from public.profiles
    where id = current_user_id
      and is_active = true
  ) then
    raise exception 'Active profile required';
  end if;

  if not exists (
    select 1
    from public.asatidz_public_directory
    where id = target_asatidz_id
  ) then
    raise exception 'Asatidz is not available';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(
      least(current_user_id::text, target_asatidz_id::text)
      || ':'
      || greatest(current_user_id::text, target_asatidz_id::text),
      0
    )
  );

  select room.id
  into room_id
  from public.chat_rooms room
  join public.chat_room_members caller
    on caller.room_id = room.id
   and caller.user_id = current_user_id
  join public.chat_room_members teacher
    on teacher.room_id = room.id
   and teacher.user_id = target_asatidz_id
  where room.room_type = 'direct'
    and room.class_id is null
    and (
      select count(*)
      from public.chat_room_members member
      where member.room_id = room.id
    ) = 2
  order by room.created_at asc
  limit 1;

  if room_id is null then
    insert into public.chat_rooms (room_type, class_id, title, created_by)
    select 'direct', null, 'Chat dengan ' || directory.nama, current_user_id
    from public.asatidz_public_directory directory
    where directory.id = target_asatidz_id
    returning id into room_id;

    insert into public.chat_room_members (room_id, user_id, member_role)
    values
      (room_id, current_user_id, 'member'),
      (room_id, target_asatidz_id, 'member');
  end if;

  return room_id;
end;
$$;

revoke all on function public.ensure_direct_chat(uuid) from public, anon;
grant execute on function public.ensure_direct_chat(uuid) to authenticated;

drop policy if exists notifications_own_update on public.notifications;
create policy notifications_own_update on public.notifications
  for update to authenticated
  using (recipient_id = (select auth.uid()))
  with check (recipient_id = (select auth.uid()));

grant update (is_read) on public.notifications to authenticated;

commit;
