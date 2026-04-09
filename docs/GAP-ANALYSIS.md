# Brickhouse Foundation — Gap Analysis Report

**Date:** 2026-04-09
**Scope:** 5-pass deep reconnaissance — no code changes
**Branch:** `claude/gap-analysis-codebase-fkw0C`

---

## Executive Summary

Three systems were confirmed working: Lovable badge removal (white-labeling), custom domain (`app.brickhousemindset.com`), and reminder scheduling. This analysis focuses on the **lesson completion save failure** (progress bar stuck at 0 of 17) and identifies all related gaps across authentication, database policies, error handling, notification infrastructure, and branding.

**Root cause confirmed:** The lesson save path has **no error handling** — the mutation fires without `onError`, the user is navigated away on a 600ms timeout regardless of success/failure, and no toast feedback exists. When combined with a potential RLS policy gap on the live Supabase instance, lesson completions silently fail.

---

## Table of Contents

1. [CRITICAL — Lesson Completion Save Path](#1-critical--lesson-completion-save-path)
2. [CRITICAL — Error Handling Gap](#2-critical--error-handling-gap)
3. [HIGH — RLS Policy Analysis](#3-high--rls-policy-analysis)
4. [HIGH — INSERT vs UPSERT](#4-high--insert-vs-upsert)
5. [MEDIUM — Inconsistent Unlock Logic](#5-medium--inconsistent-unlock-logic)
6. [MEDIUM — Analytics Fires Before Save Confirms](#6-medium--analytics-fires-before-save-confirms)
7. [LOW — Notification Infrastructure Gaps](#7-low--notification-infrastructure-gaps)
8. [INFO — White-Label & Domain Status](#8-info--white-label--domain-status)
9. [Full File Inventory](#9-full-file-inventory)
10. [Recommended Fix Priority](#10-recommended-fix-priority)

---

## 1. CRITICAL — Lesson Completion Save Path

### Current Flow (Broken)

```
LessonPlayer.tsx:119  →  onClick={handleComplete}
    ↓
handleComplete() [lines 34-47]
    ↓
toggleLesson.mutate({ lessonId, brickId, completed: true })   ← FIRE AND FORGET
    ↓                                                          ← NO await
trackEvent("lesson_completed", ...)                            ← FIRES REGARDLESS
    ↓
setTimeout(600ms) → navigate(`/bricks/${brick.slug}`)          ← ALWAYS NAVIGATES
```

### Problems

| # | Issue | File | Lines |
|---|-------|------|-------|
| 1 | `toggleLesson.mutate()` called without `onSuccess`/`onError` callbacks | `src/pages/LessonPlayer.tsx` | 36 |
| 2 | Navigation fires on a fixed 600ms timeout, independent of mutation result | `src/pages/LessonPlayer.tsx` | 44-46 |
| 3 | User is navigated away before knowing if save succeeded or failed | `src/pages/LessonPlayer.tsx` | 44-46 |
| 4 | Analytics event recorded even if lesson save fails | `src/pages/LessonPlayer.tsx` | 41 |
| 5 | No loading indicator while save is in progress | `src/pages/LessonPlayer.tsx` | 118-135 |

### What The User Sees

- Taps "I'VE DONE THE WORK"
- Gets navigated back to brick detail after 600ms
- Progress bar still shows "0 of 17"
- No error message, no success message, no visual feedback

---

## 2. CRITICAL — Error Handling Gap

### useLessonProgress.ts — Missing Error Handler

The `toggleLesson` mutation in `src/hooks/useLessonProgress.ts` (lines 23-58) has:
- `mutationFn` — calls `.insert()` or `.delete()` with `if (error) throw error`
- `onSuccess` — invalidates query cache (line 55-57)
- **NO `onError` handler** — errors propagate silently to React Query's default handler

### Comparison to Other Hooks (Reference Pattern)

`src/hooks/useCrudField.ts` (lines 108-112) demonstrates the correct pattern:

```typescript
onError: (err, variables, context) => {
  console.error(`Error mutating ${options.tableName}:`, err);
  queryClient.setQueryData(options.queryKey, context?.previousData);
  toast.error("Failed to save changes.");
},
```

This pattern is used by: `useDailyRitual`, `usePassionPick`, `useAffirmations`, `useSchedulerTasks` — but **NOT** by `useLessonProgress`.

### Toast Infrastructure Exists But Is Not Used

- Sonner library is installed and mounted in `App.tsx` (lines 71-72)
- `toast.success()` and `toast.error()` are used 35+ times across the app
- Zero toast calls exist in the lesson completion flow
- No "Lesson saved" or "Error saving lesson" messages exist anywhere in the codebase

---

## 3. HIGH — RLS Policy Analysis

### What's In The Migration Files

`supabase/migrations/0003_app_schema.sql` (lines 89, 101-103):

```sql
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own lesson progress"
    ON public.user_lesson_progress
    FOR ALL USING (auth.uid() = user_id);
```

### The Problem

The `FOR ALL` policy uses `USING` but **no `WITH CHECK` clause**. In PostgreSQL:

- `USING` applies to SELECT, UPDATE, DELETE
- `WITH CHECK` applies to INSERT and UPDATE (for new row values)
- When `FOR ALL` is used without `WITH CHECK`, PostgreSQL **copies the `USING` expression to `WITH CHECK`**

This _should_ work for inserts where `auth.uid() = user_id`. However:

**Possible failure scenarios on the live Supabase instance:**
1. The migration may not have been applied (Lovable may have created a different policy or none at all)
2. A previous Lovable prompt may have dropped and recreated a stricter policy
3. The policy may exist but be inactive/disabled
4. There may be a conflicting policy that takes precedence

### Recommended SQL Fix (To Run in Supabase SQL Editor)

```sql
-- Drop any existing policies
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

-- Create explicit per-operation policies
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
```

---

## 4. HIGH — INSERT vs UPSERT

### Current Code

`src/hooks/useLessonProgress.ts` (lines 36-44):

```typescript
const { error } = await supabase
  .from("user_lesson_progress")
  .insert({
    user_id: user!.id,
    lesson_id: lessonId,
    status: "completed",
    completed_at: now.toISOString(),
    next_unlock_date: nextUnlock.toISOString(),
  });
```

### Problem

This uses `.insert()` — not `.upsert()`. If a user taps "I've done the work" twice (or if a partial record already exists), the second insert will fail with a **duplicate key violation** on `(user_id, lesson_id)` if a unique constraint exists.

### Correct Pattern (Already Used Elsewhere)

`src/lib/NotificationService.ts` (line 82):
```typescript
.upsert({...}, { onConflict: "profile_id, endpoint" })
```

### Recommendation

Change `.insert()` to `.upsert()` with `onConflict: "user_id, lesson_id"` — or add a unique constraint on `(user_id, lesson_id)` first if one doesn't exist.

---

## 5. MEDIUM — Inconsistent Unlock Logic

### Two Different Unlock Calculations Exist

**Method A — `useLessonProgress.ts` (lines 86-94):**
```typescript
isLessonLocked(brickId, lessonIndex):
  - First lesson always unlocked
  - Subsequent lessons locked until previous lesson completed AND next_unlock_date has passed
  - Uses completed_at + 7 days calculation
```

**Method B — `BrickDetail.tsx` (lines 86-103):**
```typescript
Inline lock logic:
  - Uses user.created_at instead of next_unlock_date
  - Locks based on user account age + (lessonIndex * 7 days)
  - Different from the drip logic in useLessonProgress
```

### Impact

A lesson could show as "locked" on the brick detail page but "unlocked" in the lesson player, or vice versa. These two systems need to be unified.

---

## 6. MEDIUM — Analytics Fires Before Save Confirms

### Current Code

`src/pages/LessonPlayer.tsx` (lines 36-42):

```typescript
toggleLesson.mutate({ lessonId: lesson.id, brickId: brick.id, completed: true });
// Analytics fires immediately, before mutation completes
analytics.trackEvent("lesson_completed", { lesson_id: lesson.id }, brick.id.toString());
```

### Problem

The analytics event `lesson_completed` is recorded even when the actual lesson save fails. This creates phantom completions in analytics data.

### Recommendation

Move `trackEvent` into the mutation's `onSuccess` callback.

---

## 7. LOW — Notification Infrastructure Gaps

### What's Working

| Component | Status | Evidence |
|-----------|--------|----------|
| Push subscription storage | Working | `push_subscriptions` table with RLS |
| Service worker | Deployed | `/public/sw.js` with push handler |
| Reminder creation | Working | "RE.minder scheduled" toast confirmed |
| 3-level escalation | Implemented | Edge function `reminder-escalation` |
| Bug Me (snooze) | Implemented | every_minute / every_hour intervals |
| Settings toggle | Working | Daily Reminders on/off in Settings page |
| Onboarding preferences | Working | Morning/midday/evening time pickers |

### Gaps

| # | Gap | Details |
|---|-----|---------|
| 1 | No cron trigger visible in code | `reminder-escalation` edge function exists but no cron schedule is in version control — likely configured in Supabase dashboard only |
| 2 | `schedulePushNotification()` is a stub | `NotificationService.ts` line 147-155: just logs, no implementation |
| 3 | Missing VAPID env var validation | `VITE_VAPID_PUBLIC_KEY` used without fallback — will break if env var is missing |
| 4 | No notification frequency limits | Users could theoretically create unlimited reminders |
| 5 | Dual toast systems mounted | Both Sonner and Radix Toast are mounted in `App.tsx` — only Sonner is actively used |

---

## 8. INFO — White-Label & Domain Status

### Lovable Branding — Fully Removed From Code

- Zero instances of "Edit with Lovable", "Made with Lovable", or "Powered by Lovable" in the codebase
- No visible Lovable badge components
- Brand is 100% Brickhouse Mindset in all user-facing surfaces

### Lovable Platform Dependencies (Still Present, Backend Only)

| Dependency | Location | Purpose |
|------------|----------|---------|
| `lovable-tagger@^1.1.13` | `package.json` line 88 | Dev-time component tagger |
| `@lovable.dev/cloud-auth-js@^0.0.3` | `package.json` line 17 | OAuth auth (Google/Apple) |
| `componentTagger()` | `vite.config.ts` line 15 | Vite plugin for Lovable dev |
| Lovable AI Gateway | Edge functions | AI content generation (affirmations, goddess rx) |
| `LOVABLE_API_KEY` | Edge function env vars | Required for AI features |

### Known Issue: Lovable Badge Re-Appears on Publish

The badge returns every time Lovable publishes because the publish process resets it. Fix: run "Remove Edit with Lovable badge" prompt in Lovable after each publish, or add the removal to the build pipeline.

### Custom Domain Configuration

- Primary domain: `brickhousemindset.com`
- App domain: `app.brickhousemindset.com`
- Configured via Lovable dashboard (Project > Settings > Domains)
- No CNAME file in repo — DNS managed externally
- PWA manifest references "Brickhouse Mindset" throughout

### Brand Assets

| Asset | Path | Status |
|-------|------|--------|
| Logo (white) | `/public/logo-white.png` | Present (72KB) |
| Favicon | `/public/favicon.png` | Present (45KB) |
| OG Image | `/public/og-image.jpg` | Present (116KB) |
| PWA Manifest | `/public/manifest.json` | Branded correctly |
| Service Worker | `/public/sw.js` | Uses "Brickhouse Mindset" title |

---

## 9. Full File Inventory

### Core Lesson Progress Files

| File | Role | Key Lines |
|------|------|-----------|
| `src/hooks/useLessonProgress.ts` | Primary hook — query, mutation, helpers | 1-108 |
| `src/pages/LessonPlayer.tsx` | "I've done the work" button + handler | 34-47, 118-135 |
| `src/pages/BrickDetail.tsx` | Progress bar + alternate completion UI | 30, 67-79, 86-103, 132-139 |
| `src/pages/Dashboard.tsx` | "Bricks Laid" stat display | 64, 504 |
| `src/pages/MyBricks.tsx` | Per-brick progress bars | 23, 47, 64-73 |
| `src/hooks/useLeveling.ts` | XP/title calculation from completions | 1-32 |
| `src/hooks/useAnalytics.ts` | Event tracking (lesson_completed) | 1-24 |

### Database Schema Files

| File | Tables/Changes |
|------|----------------|
| `supabase/migrations/0003_app_schema.sql` | user_lesson_progress table + RLS |
| `supabase/migrations/20260325193500_lesson_drip.sql` | next_unlock_date column |
| `supabase/migrations/0001_rls_policies.sql` | Core RLS policies |
| `supabase/migrations/20260403192614_add_push_subscriptions.sql` | push_subscriptions table |

### Notification & Feedback Files

| File | Role |
|------|------|
| `src/lib/NotificationService.ts` | Push subscription, permission, test notifications |
| `public/sw.js` | Service worker — push handler, snooze, open actions |
| `src/components/ui/sonner.tsx` | Toast wrapper (primary) |
| `src/hooks/use-toast.ts` | Legacy toast hook (unused) |
| `src/pages/Settings.tsx` | Reminder toggle UI |
| `supabase/functions/reminder-escalation/index.ts` | 3-level escalation + web push |

### Auth & Config Files

| File | Role |
|------|------|
| `src/integrations/supabase/client.ts` | Supabase client init (hardcoded creds for Lovable) |
| `src/hooks/useAuth.tsx` | Auth provider + hook |
| `src/store/authStore.ts` | Zustand auth state |
| `src/components/ProtectedRoute.tsx` | Route guard |

---

## 10. Recommended Fix Priority

### Priority 1 — CRITICAL (Fix These First)

| # | Fix | File | What To Do |
|---|-----|------|------------|
| 1 | Add `onError` handler to `toggleLesson` mutation | `useLessonProgress.ts` | Add `onError` callback with `toast.error("We couldn't save your lesson progress")` |
| 2 | Add `onSuccess` handler with toast | `useLessonProgress.ts` | Add `toast.success("Lesson saved")` in `onSuccess` |
| 3 | Fix navigation timing | `LessonPlayer.tsx` | Replace `setTimeout` with navigation inside `onSuccess` callback, or use `mutateAsync` with await |
| 4 | Verify/fix RLS policies on live Supabase | Supabase SQL Editor | Run the explicit per-operation policy SQL from Section 3 |

### Priority 2 — HIGH (Fix Next)

| # | Fix | File | What To Do |
|---|-----|------|------------|
| 5 | Change `.insert()` to `.upsert()` | `useLessonProgress.ts` | Use `.upsert()` with `onConflict: "user_id, lesson_id"` |
| 6 | Move analytics to `onSuccess` | `LessonPlayer.tsx` | Move `trackEvent` into mutation success callback |
| 7 | Unify unlock logic | `BrickDetail.tsx` / `useLessonProgress.ts` | Use single source of truth for lock/unlock calculations |

### Priority 3 — MEDIUM (Polish)

| # | Fix | File | What To Do |
|---|-----|------|------------|
| 8 | Add loading state to button | `LessonPlayer.tsx` | Show spinner while `toggleLesson.isPending` |
| 9 | Implement `schedulePushNotification()` | `NotificationService.ts` | Replace stub with actual scheduling logic |
| 10 | Remove dual toast system | `App.tsx` | Remove unused Radix Toaster, keep Sonner only |
| 11 | Add VAPID key fallback | `NotificationService.ts` | Gracefully handle missing env var |

### Priority 4 — LOW (When Time Permits)

| # | Fix | File | What To Do |
|---|-----|------|------------|
| 12 | Add cron config to version control | `supabase/config.toml` | Document the cron schedule for reminder-escalation |
| 13 | Add notification frequency limits | `useSchedulerTasks.ts` | Cap max active reminders per user |
| 14 | Automate Lovable badge removal | Build pipeline | Add post-publish script to remove badge |

---

## Authentication & Security Posture

| Area | Status | Notes |
|------|--------|-------|
| Auth initialization | Secure | Dual async+listener pattern |
| Protected routes | Secure | All app routes wrapped |
| user_id in inserts | Secure | Auto-injected, no bypass |
| RLS policies | Complete in code | All 13+ tables protected — verify live state |
| Session persistence | Secure | localStorage + auto-refresh |
| Service role keys | Secure | Only in edge functions, not browser |
| Query guards | Excellent | All hooks use `enabled: !!user` |

---

## Conclusion

The lesson completion failure is caused by a combination of:
1. **Silent mutation failure** — no error handling, no user feedback
2. **Premature navigation** — user leaves the page before knowing the result
3. **Possible RLS policy mismatch** — the live Supabase instance may not have the policies from the migration files

The fix is straightforward: add error/success handlers to the mutation, replace the setTimeout navigation with success-based navigation, and verify RLS policies on the live database. The codebase already has the correct patterns in other hooks (`useCrudField.ts`) — `useLessonProgress.ts` simply needs to follow the same pattern.
