
-- Actor favorites table
create table if not exists actor_favorites (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  person_id   int  not null,
  name        text not null,
  profile_path text,
  known_for_department text,
  added_at    timestamptz not null default now(),
  unique (user_id, person_id)
);

alter table actor_favorites enable row level security;

create policy "Users manage own actor_favorites"
  on actor_favorites for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists actor_favorites_user_idx on actor_favorites(user_id);
