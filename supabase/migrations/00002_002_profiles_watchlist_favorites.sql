
-- ── 1. profiles ───────────────────────────────────────────────────────────────
create type public.user_role as enum ('user', 'admin');

create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text,
  username     text unique,
  display_name text,
  avatar_url   text,
  bio          text,
  banner_url   text,
  role         public.user_role not null default 'user',
  onboarded    boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Auto-sync new auth users into profiles
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql security definer as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- RLS helper (avoids self-loop)
create or replace function public.get_user_role(uid uuid)
returns public.user_role
language sql security definer set search_path = public
as $$ select role from profiles where id = uid; $$;

alter table public.profiles enable row level security;

create policy "admins_all" on public.profiles
  for all to authenticated using (get_user_role(auth.uid()) = 'admin'::public.user_role);

create policy "users_select_own" on public.profiles
  for select to authenticated using (auth.uid() = id);

create policy "users_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id)
  with check (role is not distinct from get_user_role(auth.uid()));

-- Public read-only view (username, avatar for profile pages)
create or replace view public.public_profiles as
  select id, username, display_name, avatar_url, banner_url, bio, created_at
  from public.profiles;

grant select on public.public_profiles to anon, authenticated;

create index profiles_username_idx on public.profiles (username);

-- ── 2. watchlist_items ────────────────────────────────────────────────────────
create table public.watchlist_items (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  session_id   uuid,
  tmdb_id      integer not null,
  media_type   text not null check (media_type in ('movie','tv')),
  title        text not null,
  poster_path  text,
  vote_average numeric(4,2) default 0,
  release_date text,
  added_at     timestamptz not null default now(),
  constraint watchlist_session_media_unique unique (session_id, tmdb_id, media_type)
);

alter table public.watchlist_items enable row level security;

create policy "anon_watchlist" on public.watchlist_items for all using (true) with check (true);
grant select, insert, update, delete on public.watchlist_items to anon, authenticated;

create index watchlist_user_idx on public.watchlist_items (user_id, added_at desc);

-- ── 3. favorite_items ─────────────────────────────────────────────────────────
create table public.favorite_items (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  session_id   uuid,
  tmdb_id      integer not null,
  media_type   text not null check (media_type in ('movie','tv')),
  title        text not null,
  poster_path  text,
  vote_average numeric(4,2) default 0,
  release_date text,
  added_at     timestamptz not null default now(),
  constraint favorites_session_media_unique unique (session_id, tmdb_id, media_type)
);

alter table public.favorite_items enable row level security;

create policy "anon_favorites" on public.favorite_items for all using (true) with check (true);
grant select, insert, update, delete on public.favorite_items to anon, authenticated;

create index favorites_user_idx on public.favorite_items (user_id, added_at desc);

-- ── 4. library_items session_id column (if migration 001 already ran) ─────────
alter table public.library_items add column if not exists session_id uuid;

-- Drop old auth-only RLS and replace with permissive
drop policy if exists "auth_select_own" on public.library_items;
drop policy if exists "auth_insert_own" on public.library_items;
drop policy if exists "auth_update_own" on public.library_items;
drop policy if exists "auth_delete_own" on public.library_items;
drop policy if exists "select_own"      on public.library_items;
drop policy if exists "insert_own"      on public.library_items;
drop policy if exists "update_own"      on public.library_items;
drop policy if exists "delete_own"      on public.library_items;
drop policy if exists "anon_select"     on public.library_items;
drop policy if exists "anon_insert"     on public.library_items;
drop policy if exists "anon_update"     on public.library_items;
drop policy if exists "anon_delete"     on public.library_items;

create policy "library_all" on public.library_items for all using (true) with check (true);
grant select, insert, update, delete on public.library_items to anon, authenticated;

alter table public.library_items drop constraint if exists library_items_user_media_unique;
alter table public.library_items drop constraint if exists library_items_session_media_unique;
alter table public.library_items add constraint library_items_session_media_unique
  unique (session_id, tmdb_id, media_type);

drop index if exists library_items_session_idx;
create index library_items_session_idx on public.library_items (session_id, added_at desc);
