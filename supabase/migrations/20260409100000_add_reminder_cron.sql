-- Version-control the cron schedule for reminder-escalation
-- Sprint 2, Epic 2.3
--
-- This migration enables pg_cron and schedules the reminder-escalation
-- edge function to run every 15 minutes.
--
-- NOTE: pg_cron and pg_net must be enabled in your Supabase project settings
-- (Database > Extensions) before this migration can run.
-- If running in a local dev environment without these extensions, this
-- migration will be skipped gracefully.

DO $$
BEGIN
  -- Only attempt to schedule if pg_cron extension is available
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Remove existing schedule if present
    PERFORM cron.unschedule('reminder-escalation');
  EXCEPTION WHEN OTHERS THEN
    -- Job doesn't exist yet, that's fine
    NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron')
     AND EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
    PERFORM cron.schedule(
      'reminder-escalation',
      '*/15 * * * *',
      $$
      SELECT net.http_post(
        url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_url') || '/functions/v1/reminder-escalation',
        headers := jsonb_build_object(
          'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key'),
          'Content-Type', 'application/json'
        ),
        body := '{}'::jsonb
      );
      $$
    );
    RAISE NOTICE 'reminder-escalation cron job scheduled every 15 minutes';
  ELSE
    RAISE NOTICE 'pg_cron or pg_net not available — configure cron schedule manually in Supabase dashboard';
  END IF;
END $$;
