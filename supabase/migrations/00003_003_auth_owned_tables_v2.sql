
-- ══════════════════════════════════════════════════════════════════
-- Migration 003 v2: Auth-owned library/favorites/watchlist + profiles
-- ══════════════════════════════════════════════════════════════════

-- 1. Ensure user_role type exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('user', 'admin');
  END IF;
END $$;

-- 2. Add new columns to profiles (full_name + provider_avatar_url)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS provider_avatar_url text;

ALTER TABLE public.profiles
  ALTER COLUMN onboarded SET DEFAULT true;

-- 3. Update handle_new_user: sync full_name + provider avatar from OAuth metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, provider_avatar_url, role, onboarded)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(COALESCE(NEW.email,''), '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    ),
    'user'::public.user_role,
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name          = EXCLUDED.full_name,
    provider_avatar_url = EXCLUDED.provider_avatar_url,
    email              = EXCLUDED.email;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. RLS helper
CREATE OR REPLACE FUNCTION public.get_user_role(uid uuid)
RETURNS public.user_role
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = uid;
$$;

-- 5. Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Admins have full access to profiles" ON public.profiles
  FOR ALL TO authenticated USING (public.get_user_role(auth.uid()) = 'admin'::public.user_role);
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (role IS NOT DISTINCT FROM public.get_user_role(auth.uid()));

-- 6. Drop old permissive policies
DROP POLICY IF EXISTS "Allow all for library_items" ON public.library_items;
DROP POLICY IF EXISTS "Allow all for favorite_items" ON public.favorite_items;
DROP POLICY IF EXISTS "Allow all for watchlist_items" ON public.watchlist_items;

-- 7. library_items — add user_id ownership
ALTER TABLE public.library_items
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.library_items
  ALTER COLUMN user_id SET DEFAULT auth.uid();

ALTER TABLE public.library_items
  DROP CONSTRAINT IF EXISTS library_items_session_id_tmdb_id_media_type_key;
DROP INDEX IF EXISTS library_items_session_tmdb_idx;
ALTER TABLE public.library_items
  DROP CONSTRAINT IF EXISTS library_items_user_id_tmdb_id_media_type_key;
ALTER TABLE public.library_items
  ADD CONSTRAINT library_items_user_id_tmdb_id_media_type_key
  UNIQUE (user_id, tmdb_id, media_type);

CREATE INDEX IF NOT EXISTS library_items_user_idx ON public.library_items(user_id);

ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own library" ON public.library_items;
CREATE POLICY "Users manage own library" ON public.library_items
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 8. favorite_items — add user_id ownership
ALTER TABLE public.favorite_items
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.favorite_items
  ALTER COLUMN user_id SET DEFAULT auth.uid();

ALTER TABLE public.favorite_items
  DROP CONSTRAINT IF EXISTS favorite_items_session_id_tmdb_id_media_type_key;
ALTER TABLE public.favorite_items
  DROP CONSTRAINT IF EXISTS favorite_items_user_id_tmdb_id_media_type_key;
ALTER TABLE public.favorite_items
  ADD CONSTRAINT favorite_items_user_id_tmdb_id_media_type_key
  UNIQUE (user_id, tmdb_id, media_type);

CREATE INDEX IF NOT EXISTS favorite_items_user_idx ON public.favorite_items(user_id);

ALTER TABLE public.favorite_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own favorites" ON public.favorite_items;
CREATE POLICY "Users manage own favorites" ON public.favorite_items
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 9. watchlist_items — add user_id ownership
ALTER TABLE public.watchlist_items
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.watchlist_items
  ALTER COLUMN user_id SET DEFAULT auth.uid();

ALTER TABLE public.watchlist_items
  DROP CONSTRAINT IF EXISTS watchlist_items_user_id_tmdb_id_media_type_key;
ALTER TABLE public.watchlist_items
  ADD CONSTRAINT watchlist_items_user_id_tmdb_id_media_type_key
  UNIQUE (user_id, tmdb_id, media_type);

CREATE INDEX IF NOT EXISTS watchlist_items_user_idx ON public.watchlist_items(user_id);

ALTER TABLE public.watchlist_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own watchlist" ON public.watchlist_items;
CREATE POLICY "Users manage own watchlist" ON public.watchlist_items
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 10. Drop old public_profiles view and recreate with full_name
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles AS
  SELECT id, full_name, display_name, username, avatar_url, provider_avatar_url, bio, role, created_at
  FROM public.profiles;
