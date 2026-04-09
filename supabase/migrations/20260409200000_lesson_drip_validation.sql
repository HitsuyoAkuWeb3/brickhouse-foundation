-- Server-side lesson drip validation trigger
-- Sprint 3, Epic 3.4
--
-- Prevents users from bypassing the 7-day drip lock by calling
-- the Supabase API directly. Validates that the previous lesson
-- in the same brick is completed and its unlock date has passed.

CREATE OR REPLACE FUNCTION validate_lesson_unlock()
RETURNS TRIGGER AS $$
DECLARE
  prev_unlock TIMESTAMP WITH TIME ZONE;
  brick_num TEXT;
  lesson_num INT;
  prev_lesson_id TEXT;
BEGIN
  -- Extract brick and lesson numbers from lesson_id format "N-M"
  brick_num := split_part(NEW.lesson_id::text, '-', 1);
  lesson_num := split_part(NEW.lesson_id::text, '-', 2)::int;

  -- First lesson (index 0) is always allowed
  IF lesson_num = 0 THEN RETURN NEW; END IF;

  -- Build previous lesson ID
  prev_lesson_id := brick_num || '-' || (lesson_num - 1);

  -- Check previous lesson's unlock date
  SELECT next_unlock_date INTO prev_unlock
  FROM user_lesson_progress
  WHERE user_id = NEW.user_id
    AND lesson_id = prev_lesson_id
    AND status = 'completed';

  IF prev_unlock IS NULL THEN
    RAISE EXCEPTION 'Previous lesson (%) not completed', prev_lesson_id;
  END IF;

  IF NOW() < prev_unlock THEN
    RAISE EXCEPTION 'Lesson locked until %', prev_unlock;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Only create trigger if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'enforce_lesson_drip'
  ) THEN
    CREATE TRIGGER enforce_lesson_drip
      BEFORE INSERT ON user_lesson_progress
      FOR EACH ROW EXECUTE FUNCTION validate_lesson_unlock();
  END IF;
END $$;
