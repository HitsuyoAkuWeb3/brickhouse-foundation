-- Rollback 0003 changes that conflict with Lovable migrations
ALTER TABLE profiles DROP COLUMN IF EXISTS subscription_tier;
ALTER TABLE profiles DROP COLUMN IF EXISTS shopify_customer_id;
ALTER TABLE profiles DROP COLUMN IF EXISTS onboarding_step;
ALTER TABLE profiles DROP COLUMN IF EXISTS onboarding_completed;

DROP TABLE IF EXISTS passion_picks CASCADE;
DROP TABLE IF EXISTS user_affirmations CASCADE;
DROP TABLE IF EXISTS brick_affirmations CASCADE;
DROP TABLE IF EXISTS reminders CASCADE;
DROP TABLE IF EXISTS scheduler_tasks CASCADE;

DROP TYPE IF EXISTS user_subscription_tier CASCADE;
DROP TYPE IF EXISTS content_type CASCADE;
DROP TYPE IF EXISTS transformation_track CASCADE;
