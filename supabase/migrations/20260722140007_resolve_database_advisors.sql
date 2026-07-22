-- Public object URLs do not require broad storage.objects SELECT policies.
-- Removing them prevents anonymous bucket listing while keeping public URLs functional.
drop policy if exists avatars_public_read on storage.objects;
drop policy if exists material_covers_public_read on storage.objects;

-- Keep the pre-existing role index and remove the duplicate introduced by alignment.
drop index if exists public.profiles_role_idx;

-- Supabase recommends keeping extensions out of the exposed public schema.
create schema if not exists extensions;
alter extension unaccent set schema extensions;
