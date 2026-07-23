drop policy if exists reviews_public_select on public.reviews;
create policy reviews_public_select on public.reviews for select to anon
using (status = 'published');

drop policy if exists reviews_owner_or_admin_select on public.reviews;
create policy reviews_owner_or_admin_select on public.reviews for select to authenticated
using (
  status = 'published'
  or reviewer_id = (select auth.uid())
  or (select app_private.is_admin())
);
