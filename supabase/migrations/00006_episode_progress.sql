
CREATE TABLE IF NOT EXISTS public.episode_progress (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL DEFAULT auth.uid()
                  REFERENCES public.profiles(id) ON DELETE CASCADE,
  tv_id           integer NOT NULL,
  season_number   integer NOT NULL,
  episode_number  integer NOT NULL,
  watched         boolean NOT NULL DEFAULT false,
  position_secs   integer NOT NULL DEFAULT 0,
  duration_secs   integer NOT NULL DEFAULT 0,
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT episode_progress_unique UNIQUE (user_id, tv_id, season_number, episode_number)
);

DROP TRIGGER IF EXISTS episode_progress_updated_at ON public.episode_progress;
CREATE TRIGGER episode_progress_updated_at
  BEFORE UPDATE ON public.episode_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.episode_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_episode_progress" ON public.episode_progress;
CREATE POLICY "users_manage_episode_progress" ON public.episode_progress
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS episode_progress_user_tv_idx
  ON public.episode_progress (user_id, tv_id);
