create table if not exists public.saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  asatidz_id uuid references public.profiles(id) on delete cascade,
  private_class_id uuid references public.private_class_pages(id) on delete cascade,
  material_id uuid references public.materials(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint saved_items_one_target_check check (
    num_nonnulls(asatidz_id, private_class_id, material_id) = 1
  )
);

create unique index if not exists saved_items_user_asatidz_uidx
  on public.saved_items(user_id, asatidz_id) where asatidz_id is not null;
create unique index if not exists saved_items_user_private_class_uidx
  on public.saved_items(user_id, private_class_id) where private_class_id is not null;
create unique index if not exists saved_items_user_material_uidx
  on public.saved_items(user_id, material_id) where material_id is not null;
create index if not exists saved_items_user_created_idx on public.saved_items(user_id, created_at desc);
create index if not exists saved_items_asatidz_idx on public.saved_items(asatidz_id);
create index if not exists saved_items_private_class_idx on public.saved_items(private_class_id);
create index if not exists saved_items_material_idx on public.saved_items(material_id);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  asatidz_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null constraint reviews_rating_check check (rating between 1 and 5),
  content text not null constraint reviews_content_length_check check (char_length(btrim(content)) between 3 and 2000),
  status text not null default 'published' constraint reviews_status_check check (status in ('published', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reviews_reviewer_asatidz_unique unique (reviewer_id, asatidz_id),
  constraint reviews_not_self_check check (reviewer_id <> asatidz_id)
);

create index if not exists reviews_asatidz_status_created_idx
  on public.reviews(asatidz_id, status, created_at desc);
create index if not exists reviews_reviewer_idx on public.reviews(reviewer_id);

drop trigger if exists set_reviews_updated_at on public.reviews;
create trigger set_reviews_updated_at before update on public.reviews
for each row execute function public.set_updated_at();

alter table public.saved_items enable row level security;
alter table public.reviews enable row level security;

drop policy if exists saved_items_owner_select on public.saved_items;
create policy saved_items_owner_select on public.saved_items for select to authenticated
using (user_id = (select auth.uid()) or (select app_private.is_admin()));

drop policy if exists reviews_public_select on public.reviews;
create policy reviews_public_select on public.reviews for select to anon, authenticated
using (status = 'published');

drop policy if exists reviews_owner_or_admin_select on public.reviews;
create policy reviews_owner_or_admin_select on public.reviews for select to authenticated
using (reviewer_id = (select auth.uid()) or (select app_private.is_admin()));

grant select on public.reviews to anon, authenticated;
grant select on public.saved_items to authenticated;
