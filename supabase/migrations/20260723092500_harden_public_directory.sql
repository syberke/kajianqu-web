begin;

create table if not exists public.asatidz_public_directory (
  id uuid primary key references public.profiles(id) on delete cascade,
  nama text not null,
  foto_url text,
  title text,
  bidang text,
  bio text,
  teaching_area text,
  memorization_juz numeric,
  updated_at timestamptz not null default now()
);

alter table public.asatidz_public_directory enable row level security;

drop policy if exists asatidz_directory_public_read on public.asatidz_public_directory;
create policy asatidz_directory_public_read on public.asatidz_public_directory
  for select to anon, authenticated
  using (true);

revoke all on public.asatidz_public_directory from public;
grant select on public.asatidz_public_directory to anon, authenticated;

create or replace function private.sync_asatidz_public_directory()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_id uuid;
begin
  target_id := case when tg_op = 'DELETE' then old.id else new.id end;

  insert into public.asatidz_public_directory (
    id,
    nama,
    foto_url,
    title,
    bidang,
    bio,
    teaching_area,
    memorization_juz,
    updated_at
  )
  select
    profile.id,
    profile.nama,
    profile.foto_url,
    asatidz.title,
    asatidz.bidang,
    asatidz.bio,
    asatidz.teaching_area,
    asatidz.memorization_juz,
    now()
  from public.profiles profile
  join public.asatidz_profiles asatidz on asatidz.id = profile.id
  where profile.id = target_id
    and profile.role = 'asatidz'
    and profile.is_active = true
    and asatidz.approved = true
    and asatidz.status = 'APPROVED'
  on conflict (id) do update set
    nama = excluded.nama,
    foto_url = excluded.foto_url,
    title = excluded.title,
    bidang = excluded.bidang,
    bio = excluded.bio,
    teaching_area = excluded.teaching_area,
    memorization_juz = excluded.memorization_juz,
    updated_at = excluded.updated_at;

  if not found then
    delete from public.asatidz_public_directory where id = target_id;
  end if;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

revoke all on function private.sync_asatidz_public_directory() from public, anon, authenticated;

drop trigger if exists sync_asatidz_directory_from_profile on public.profiles;
create trigger sync_asatidz_directory_from_profile
  after insert or update of nama, foto_url, role, is_active or delete
  on public.profiles
  for each row execute function private.sync_asatidz_public_directory();

drop trigger if exists sync_asatidz_directory_from_asatidz on public.asatidz_profiles;
create trigger sync_asatidz_directory_from_asatidz
  after insert or update of approved, status, title, bidang, bio, teaching_area, memorization_juz or delete
  on public.asatidz_profiles
  for each row execute function private.sync_asatidz_public_directory();

insert into public.asatidz_public_directory (
  id,
  nama,
  foto_url,
  title,
  bidang,
  bio,
  teaching_area,
  memorization_juz
)
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
on conflict (id) do update set
  nama = excluded.nama,
  foto_url = excluded.foto_url,
  title = excluded.title,
  bidang = excluded.bidang,
  bio = excluded.bio,
  teaching_area = excluded.teaching_area,
  memorization_juz = excluded.memorization_juz,
  updated_at = now();

revoke all on function public.list_public_asatidz() from public, anon, authenticated;
drop function public.list_public_asatidz();

drop policy if exists admin_full_access on public.user_roles;
drop policy if exists user_roles_own_select on public.user_roles;
create policy user_roles_own_select on public.user_roles
  for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));
create policy user_roles_admin_insert on public.user_roles
  for insert to authenticated
  with check ((select private.is_admin()));
create policy user_roles_admin_update on public.user_roles
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));
create policy user_roles_admin_delete on public.user_roles
  for delete to authenticated
  using ((select private.is_admin()));

commit;
