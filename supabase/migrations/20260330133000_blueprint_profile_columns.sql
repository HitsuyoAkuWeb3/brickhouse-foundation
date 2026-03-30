-- Brickhouse Mindset — Blueprint Profile Column Alignment
-- Adds all missing columns from Vectorized Blueprint §3.1
-- Date: 2026-03-30

-- ============================================================
-- 1. ASTROLOGY & BIRTH DETAIL COLUMNS (Phase 2 — store now)
-- ============================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birth_time TIME;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birth_city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS moon_sign TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rising_sign TEXT;

-- ============================================================
-- 2. REMINDER SCHEDULE COLUMNS
-- ============================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS morning_reminder TIME;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS midday_reminder TIME;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS evening_reminder TIME;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS morning_reminder_on BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS midday_reminder_on BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS evening_reminder_on BOOLEAN DEFAULT true;

-- ============================================================
-- 3. ONBOARDING & GOAL COLUMNS
-- ============================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS primary_goal TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS primary_focus TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT false;

-- ============================================================
-- 4. PAYMENT INTEGRATION
-- ============================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- ============================================================
-- 5. AUDIT SCORES (JSONB — for Life Audit brick scoring)
-- ============================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS audit_scores JSONB;
