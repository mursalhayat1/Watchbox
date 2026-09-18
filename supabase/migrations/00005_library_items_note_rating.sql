
ALTER TABLE public.library_items
  ADD COLUMN IF NOT EXISTS note        text,
  ADD COLUMN IF NOT EXISTS user_rating numeric(3,1)
    CHECK (user_rating IS NULL OR (user_rating >= 0 AND user_rating <= 10));
