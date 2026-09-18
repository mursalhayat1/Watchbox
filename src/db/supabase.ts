// Shim — re-exports the single canonical Supabase client.
// All imports of '@/db/supabase' share the same singleton instance as
// '@/lib/supabase/client', so auth sessions are visible everywhere.
export { supabase } from '@/lib/supabase/client';
