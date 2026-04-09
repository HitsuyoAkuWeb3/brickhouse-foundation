-- Fix lesson progress RLS policies and add unique constraint for upsert support
-- Sprint 0, Epics 0.3 + 0.4

-- Drop any conflicting policies
DROP POLICY IF EXISTS "Users can manage their own lesson progress"
    ON user_lesson_progress;
DROP POLICY IF EXISTS "Users can manage own lesson progress"
    ON user_lesson_progress;
DROP POLICY IF EXISTS "Users can insert own progress"
    ON user_lesson_progress;
DROP POLICY IF EXISTS "Users can update own progress"
    ON user_lesson_progress;
DROP POLICY IF EXISTS "Users can select own progress"
    ON user_lesson_progress;
DROP POLICY IF EXISTS "Users can delete own progress"
    ON user_lesson_progress;

-- Explicit per-operation policies
CREATE POLICY "Users can insert own progress"
    ON user_lesson_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
    ON user_lesson_progress FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can select own progress"
    ON user_lesson_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
    ON user_lesson_progress FOR DELETE
    USING (auth.uid() = user_id);

-- Add unique constraint for upsert support (Epic 0.4)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'user_lesson_progress_user_lesson_unique'
    ) THEN
        ALTER TABLE public.user_lesson_progress
            ADD CONSTRAINT user_lesson_progress_user_lesson_unique
            UNIQUE (user_id, lesson_id);
    END IF;
END $$;
