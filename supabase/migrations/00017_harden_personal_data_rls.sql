-- SECURITY REVIEW REQUIRED BEFORE APPLYING.
-- Removes only the legacy permissive policies identified in migrations 00002/00003.
-- No rows are changed, deleted, or backfilled. Existing authenticated user-owned policies
-- from migrations 00003, 00004 and 00015 remain in place.
--
-- Applying this intentionally disables anonymous/guest access to these personal-data tables.
-- Obtain explicit owner approval and verify the live Supabase migration state first.

DROP POLICY IF EXISTS "library_all" ON public.library_items;
DROP POLICY IF EXISTS "anon_watchlist" ON public.watchlist_items;
DROP POLICY IF EXISTS "anon_favorites" ON public.favorite_items;
