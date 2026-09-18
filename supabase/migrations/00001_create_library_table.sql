
-- Library / watchlist table
create table public.library_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid(),
  tmdb_id     integer not null,
  media_type  text not null check (media_type in ('movie','tv')),
  title       text not null,
  poster_path text,
  backdrop_path text,
  vote_average numeric(4,2) default 0,
  release_date text,
  status      text not null default 'Plan to Watch'
              check (status in ('Watching','Completed','Plan to Watch','On Hold','Dropped')),
  added_at    timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint library_items_user_media_unique unique (user_id, tmdb_id, media_type)
);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql security definer as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger library_items_updated_at
  before update on public.library_items
  for each row execute function public.set_updated_at();

-- RLS
alter table public.library_items enable row level security;

-- anon: no access
-- authenticated: full access to own rows only
create policy "auth_select_own" on public.library_items
  for select to authenticated using (user_id = auth.uid());

create policy "auth_insert_own" on public.library_items
  for insert to authenticated with check (user_id = auth.uid());

create policy "auth_update_own" on public.library_items
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "auth_delete_own" on public.library_items
  for delete to authenticated using (user_id = auth.uid());

-- Index for fast per-user listing
create index library_items_user_id_idx on public.library_items (user_id, added_at desc);
create index library_items_tmdb_idx on public.library_items (user_id, tmdb_id, media_type);
