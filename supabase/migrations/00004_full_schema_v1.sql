
-- ══════════════════════════════════════════════════════════════════
-- Full schema: profiles, library_items, favorite_items, watchlist_items
-- Auth-owned with RLS, triggers, and helper functions
-- ══════════════════════════════════════════════════════════════════

-- 1. user_role enum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('user', 'admin');
  END IF;
END $$;

-- 2. set_updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 3. profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id                  uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email               text,
  username            text UNIQUE,
  display_name        text,
  full_name           text,
  avatar_url          text,
  provider_avatar_url text,
  bio                 text,
  banner_url          text,
  role                public.user_role NOT NULL DEFAULT 'user',
  onboarded           boolean NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. handle_new_user trigger: sync OAuth metadata on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, provider_avatar_url, role, onboarded)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(COALESCE(NEW.email, ''), '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    ),
    'user'::public.user_role,
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name           = EXCLUDED.full_name,
    provider_avatar_url = EXCLUDED.provider_avatar_url,
    email               = EXCLUDED.email;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. get_user_role helper (SECURITY DEFINER — avoids RLS self-loop)
CREATE OR REPLACE FUNCTION public.get_user_role(uid uuid)
RETURNS public.user_role LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.profiles WHERE id = uid;
$$;

-- 6. profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins_all"        ON public.profiles;
DROP POLICY IF EXISTS "users_select_own"  ON public.profiles;
DROP POLICY IF EXISTS "users_update_own"  ON public.profiles;

CREATE POLICY "admins_all" ON public.profiles
  FOR ALL TO authenticated USING (public.get_user_role(auth.uid()) = 'admin'::public.user_role);
CREATE POLICY "users_select_own" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (role IS NOT DISTINCT FROM public.get_user_role(auth.uid()));

-- Public read-only view
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles AS
  SELECT id, full_name, display_name, username, avatar_url, provider_avatar_url, bio, role, created_at
  FROM public.profiles;
GRANT SELECT ON public.public_profiles TO anon, authenticated;

CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles (username);

-- 7. library_items
CREATE TABLE IF NOT EXISTS public.library_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  tmdb_id       integer NOT NULL,
  media_type    text NOT NULL CHECK (media_type IN ('movie','tv')),
  title         text NOT NULL,
  poster_path   text,
  backdrop_path text,
  vote_average  numeric(4,2) DEFAULT 0,
  release_date  text,
  status        text NOT NULL DEFAULT 'Plan to Watch'
                CHECK (status IN ('Watching','Completed','Plan to Watch','On Hold','Dropped')),
  added_at      timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT library_items_user_media_unique UNIQUE (user_id, tmdb_id, media_type)
);

DROP TRIGGER IF EXISTS library_items_updated_at ON public.library_items;
CREATE TRIGGER library_items_updated_at
  BEFORE UPDATE ON public.library_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_manage_library" ON public.library_items;
CREATE POLICY "users_manage_library" ON public.library_items
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS library_items_user_id_idx ON public.library_items (user_id, added_at DESC);
CREATE INDEX IF NOT EXISTS library_items_tmdb_idx    ON public.library_items (user_id, tmdb_id, media_type);

-- 8. favorite_items
CREATE TABLE IF NOT EXISTS public.favorite_items (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  tmdb_id      integer NOT NULL,
  media_type   text NOT NULL CHECK (media_type IN ('movie','tv')),
  title        text NOT NULL,
  poster_path  text,
  vote_average numeric(4,2) DEFAULT 0,
  release_date text,
  added_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT favorite_items_user_media_unique UNIQUE (user_id, tmdb_id, media_type)
);

ALTER TABLE public.favorite_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_manage_favorites" ON public.favorite_items;
CREATE POLICY "users_manage_favorites" ON public.favorite_items
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS favorite_items_user_idx ON public.favorite_items (user_id, added_at DESC);
CREATE INDEX IF NOT EXISTS favorite_items_tmdb_idx  ON public.favorite_items (user_id, tmdb_id, media_type);

-- 9. watchlist_items
CREATE TABLE IF NOT EXISTS public.watchlist_items (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  tmdb_id      integer NOT NULL,
  media_type   text NOT NULL CHECK (media_type IN ('movie','tv')),
  title        text NOT NULL,
  poster_path  text,
  vote_average numeric(4,2) DEFAULT 0,
  release_date text,
  added_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT watchlist_items_user_media_unique UNIQUE (user_id, tmdb_id, media_type)
);

ALTER TABLE public.watchlist_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_manage_watchlist" ON public.watchlist_items;
CREATE POLICY "users_manage_watchlist" ON public.watchlist_items
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS watchlist_items_user_idx ON public.watchlist_items (user_id, added_at DESC);
