# Brickhouse Foundation — Scrumban Sprint Plan

**Date:** 2026-04-09
**Source:** Gap Analysis (5-pass deep recon)
**Method:** Scrumban — pull-based flow, WIP limits, time-boxed sprints
**Branch:** `claude/gap-analysis-codebase-fkw0C`

---

## Board Configuration

### Columns

| Column | WIP Limit | Purpose |
|--------|-----------|---------|
| Backlog | Unlimited | Groomed, ready to pull |
| In Progress | 2 | Active development |
| Review | 2 | Code review + QA |
| Done | - | Deployed & verified |

### Cadence

- **Sprint length:** 3 days (micro-sprints for velocity on a Lovable-deployed app)
- **Daily standup:** Async — update card status + blockers
- **Pull signal:** Dev pulls next card when WIP slot opens
- **Definition of Done:** Code committed, toast/UI verified on `app.brickhousemindset.com`, no regression on existing features

---

## Sprint 0 — CRITICAL PATH: Lesson Save Fix

**Goal:** Make "I've done the work" actually save to the database and give the user feedback.
**Duration:** 3 days
**Velocity target:** 4 cards

---

### Epic 0.1 — Error Handling on toggleLesson Mutation

#### HLD

The `useLessonProgress` hook fires a mutation with zero error handling. Every other mutation hook in the codebase (`useCrudField`, `useSchedulerTasks`, `usePassionPick`) uses the `onError` → `toast.error()` pattern. This hook is the only one that doesn't. The fix is to align it with the established pattern.

**Architecture decision:** Keep `useLessonProgress` as a standalone hook (don't refactor into `useCrudField`) because it has custom drip logic (`next_unlock_date`, `isLessonLocked`, `getUnlockCountdown`) that doesn't fit the generic CRUD abstraction.

#### LLD

**File:** `src/hooks/useLessonProgress.ts`

**Change 1 — Add `toast` import (line 1 area):**
```typescript
import { toast } from "sonner";
```

**Change 2 — Add `onError` handler to `toggleLesson` mutation (after line 57):**
```typescript
onError: (err: any) => {
  console.error("Error saving lesson progress:", err);
  toast.error("We couldn't save your lesson progress");
},
```

**Change 3 — Add success toast inside existing `onSuccess` (line 55-57):**
```typescript
onSuccess: (_data, variables) => {
  queryClient.invalidateQueries({ queryKey: ["lesson-progress", user?.id] });
  if (variables.completed) {
    toast.success("Lesson saved");
  }
},
```

**Reference pattern:** `src/hooks/useCrudField.ts:108-112`

**Acceptance criteria:**
- [ ] Tapping "I've done the work" shows "Lesson saved" toast on success
- [ ] If Supabase rejects the write, "We couldn't save your lesson progress" toast appears
- [ ] No silent failures

---

### Epic 0.2 — Fix Navigation Timing in LessonPlayer

#### HLD

Currently `handleComplete()` in `LessonPlayer.tsx` fires `toggleLesson.mutate()` and then unconditionally navigates away on a 600ms `setTimeout`. The user leaves the page before knowing if the save worked. Fix: use `mutateAsync` + `await` so navigation only happens after confirmed save, or move navigation into the mutation's `onSuccess` callback.

**Architecture decision:** Use inline `onSuccess`/`onError` overrides on the `.mutate()` call rather than `mutateAsync`, because the component already has a simple imperative handler and we want to keep the pattern consistent with how other pages call mutations.

#### LLD

**File:** `src/pages/LessonPlayer.tsx`

**Replace `handleComplete` function (lines 34-47) with:**
```typescript
const handleComplete = () => {
  if (!completed) {
    toggleLesson.mutate(
      { lessonId: lesson.id, brickId: brick.id, completed: true },
      {
        onSuccess: () => {
          trackEvent("lesson_completed", { lesson_id: lesson.id }, brick.id.toString());
          setTimeout(() => navigate(`/bricks/${brick.slug}`), 600);
        },
      }
    );
  } else {
    navigate(`/bricks/${brick.slug}`);
  }
};
```

**Key changes:**
1. `trackEvent` moves inside `onSuccess` — no more phantom analytics
2. `setTimeout` + `navigate` moves inside `onSuccess` — no navigation on failure
3. If already completed, navigate immediately (no mutation needed)

**Also update button (line 120):**
```typescript
disabled={completed || toggleLesson.isPending}
```

**Add loading state to button label (line 133 area):**
```typescript
toggleLesson.isPending ? "SAVING..." : "I'VE DONE THE WORK"
```

**Acceptance criteria:**
- [ ] User stays on lesson page if save fails (sees error toast from Epic 0.1)
- [ ] User navigates back only after confirmed save
- [ ] Analytics only fire on successful save
- [ ] Button shows "SAVING..." and is disabled while mutation is in flight

---

### Epic 0.3 — RLS Policy Verification & Fix

#### HLD

The migration file `0003_app_schema.sql` defines a `FOR ALL USING (auth.uid() = user_id)` policy. This should work, but the live Supabase instance may have a different state due to Lovable publish cycles. The fix is to run explicit per-operation policies in the Supabase SQL Editor to guarantee correctness.

**Architecture decision:** Create a new migration file in the repo so the fix is version-controlled, even though the immediate fix is applied via the Supabase SQL Editor.

#### LLD

**Step 1 — Immediate fix (Supabase SQL Editor, no code change):**

```sql
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
```

**Step 2 — Version control (new migration file):**

**File:** `supabase/migrations/20260409000000_fix_lesson_progress_rls.sql`

Same SQL as above, wrapped in `DO $$ ... $$` for idempotency.

**Acceptance criteria:**
- [ ] All four policies visible in Supabase Dashboard > Authentication > Policies
- [ ] `user_lesson_progress` INSERT returns success for authenticated user
- [ ] Progress bar updates from "0 of 17" after completing a lesson

---

### Epic 0.4 — Change INSERT to UPSERT

#### HLD

`useLessonProgress.ts` uses `.insert()` which will throw a duplicate key error if a user taps "I've done the work" twice or if a partial record exists. The `NotificationService.ts` already demonstrates the correct `.upsert()` pattern with `onConflict`.

**Prerequisite:** A unique constraint on `(user_id, lesson_id)` must exist. If it doesn't, add it in the same migration as Epic 0.3.

#### LLD

**File:** `src/hooks/useLessonProgress.ts` (lines 36-44)

**Replace `.insert()` with `.upsert()`:**
```typescript
const { error } = await (supabase as any)
  .from("user_lesson_progress")
  .upsert({
    user_id: user!.id,
    lesson_id: lessonId,
    status: "completed",
    completed_at: new Date().toISOString(),
    next_unlock_date: nextUnlock.toISOString(),
  }, { onConflict: "user_id,lesson_id" });
```

**Migration file addition (append to `20260409000000_fix_lesson_progress_rls.sql`):**
```sql
-- Add unique constraint for upsert support
ALTER TABLE public.user_lesson_progress
    ADD CONSTRAINT user_lesson_progress_user_lesson_unique
    UNIQUE (user_id, lesson_id);
```

**Acceptance criteria:**
- [ ] Tapping "I've done the work" twice doesn't throw an error
- [ ] Second tap is a no-op (upsert overwrites with same data)
- [ ] No duplicate rows in `user_lesson_progress`

---

## Sprint 1 — HIGH: Data Integrity & UX Consistency

**Goal:** Unify unlock logic, fix analytics ordering, clean up feedback paths.
**Duration:** 3 days
**Velocity target:** 3 cards
**Depends on:** Sprint 0 complete

---

### Epic 1.1 — Unify Unlock Logic (BrickDetail vs useLessonProgress)

#### HLD

Two competing unlock systems exist:

| Location | Method | Source |
|----------|--------|--------|
| `useLessonProgress.ts:86-94` | `completed_at + 7 days` from lesson progress | Drip migration |
| `BrickDetail.tsx:89-103` | `user.created_at + (index * 7 days)` | Account age |

These can disagree. A user who signed up 8 weeks ago but only completed 2 lessons would see different lock states depending on which page they're on.

**Architecture decision:** `useLessonProgress.isLessonLocked()` is the single source of truth. `BrickDetail.tsx` should use it instead of inline calculations.

#### LLD

**File:** `src/pages/BrickDetail.tsx`

**Remove inline lock logic (lines 86-103). Replace with:**
```typescript
const { isLessonLocked, getUnlockCountdown } = useLessonProgress();
// Already destructured at line 13, just add isLessonLocked and getUnlockCountdown

// Inside map (line 83):
const locked = !isUnlocked || isLessonLocked(brick.id, i);
const countdown = getUnlockCountdown(brick.id, i);
```

**Remove:** `unlockDate` variable, `addDays`/`isBefore`/`formatDistanceToNow` imports from `date-fns` (line 8) — unless used elsewhere in file.

**Update unlock display (line 161-163):**
```typescript
{countdown ? (
  <p className="font-body text-xs text-accent mt-0.5 leading-relaxed">
    {countdown}
  </p>
) : ( ... )}
```

**Acceptance criteria:**
- [ ] BrickDetail and LessonPlayer show same lock/unlock state
- [ ] Countdown text comes from `getUnlockCountdown()` in both places
- [ ] No `date-fns` import remaining if unused

---

### Epic 1.2 — Add Loading State to BrickDetail Checkbox

#### HLD

The checkbox in `BrickDetail.tsx` (line 132-139) calls `toggleLesson.mutate()` directly in `onClick` with no loading indicator and no error handling. Same pattern as the original LessonPlayer bug.

#### LLD

**File:** `src/pages/BrickDetail.tsx` (lines 132-148)

**Wrap the onClick handler to prevent double-clicks:**
```typescript
onClick={(e) => {
  e.preventDefault();
  e.stopPropagation();
  if (!toggleLesson.isPending) {
    toggleLesson.mutate({
      lessonId: lesson.id,
      brickId: brick.id,
      completed: !completed,
    });
  }
}}
```

**Acceptance criteria:**
- [ ] Checkbox doesn't fire multiple mutations on rapid clicks
- [ ] Error toast appears on failure (inherited from Epic 0.1 onError handler)

---

### Epic 1.3 — Remove Dual Toast System

#### HLD

`App.tsx` mounts both `<Toaster />` (Radix) and `<Sonner />`. Only Sonner is actively used across the app (35+ calls). The Radix Toaster is legacy. However, `Settings.tsx` uses `useToast()` from the Radix system (line 8, 17). This must be migrated before removing.

#### LLD

**File:** `src/pages/Settings.tsx`

**Replace:**
```typescript
import { useToast } from "@/components/ui/use-toast";
```
**With:**
```typescript
import { toast } from "sonner";
```

**Replace all `toast({ ... })` calls** with `toast.success()` / `toast.error()` equivalents. Grep for any other files using `useToast` first.

**File:** `src/App.tsx` (line 1, 71)

**Remove:**
```typescript
import { Toaster } from "@/components/ui/toaster";
// and
<Toaster />
```

**Acceptance criteria:**
- [ ] No imports of `useToast` or `@/components/ui/toaster` remain
- [ ] All toasts render via Sonner
- [ ] Settings page save/error toasts still work

---

## Sprint 2 — MEDIUM: Notification Polish & Infrastructure

**Goal:** Implement the push notification stub, add VAPID fallback, clean up cron visibility.
**Duration:** 3 days
**Velocity target:** 3 cards
**Depends on:** Sprint 1 complete

---

### Epic 2.1 — Implement schedulePushNotification()

#### HLD

`NotificationService.schedulePushNotification()` (line 147-155) is a stub that only logs. The actual scheduling should create a `scheduler_tasks` record with `reminder_type: "one_off"` and the scheduled timestamp, then let the `reminder-escalation` edge function handle delivery.

**Architecture decision:** Don't implement client-side scheduling (setTimeout/setInterval). Delegate to the existing server-side escalation system via a database record.

#### LLD

**File:** `src/lib/NotificationService.ts` (lines 147-155)

**Replace stub with:**
```typescript
static async schedulePushNotification(params: {
  title: string;
  body: string;
  scheduledFor: Date;
  profileId: string;
  tag?: string;
  data?: Record<string, unknown>;
}) {
  const { error } = await supabase.from("scheduler_tasks").insert({
    profile_id: params.profileId,
    title: params.title,
    description: params.body,
    task_type: "push_notification",
    reminder_type: "one_off",
    scheduled_for: params.scheduledFor.toISOString(),
    is_active: true,
  });
  if (error) {
    console.error("[NotificationService] Failed to schedule push:", error);
    throw error;
  }
}
```

**Acceptance criteria:**
- [ ] `schedulePushNotification()` creates a `scheduler_tasks` row
- [ ] `reminder-escalation` edge function picks it up on next cron cycle
- [ ] Affirmation scheduling (Affirmations.tsx:250-255) actually sends a push at the scheduled time

---

### Epic 2.2 — VAPID Key Fallback & Validation

#### HLD

`NotificationService.ts` line 47 reads `import.meta.env.VITE_VAPID_PUBLIC_KEY` without fallback. If the env var is missing (common in Lovable deploys where `import.meta.env` can be unreliable), push subscription silently skips. The Supabase client already demonstrates the fallback pattern (hardcoded values in `client.ts:6-7`).

#### LLD

**File:** `src/lib/NotificationService.ts` (line 47)

**Replace:**
```typescript
const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
```
**With:**
```typescript
const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || "<HARDCODED_VAPID_PUBLIC_KEY>";
```

**Note:** The actual VAPID public key must be retrieved from the Supabase project's edge function environment or generated via `web-push generate-vapid-keys`.

**Acceptance criteria:**
- [ ] Push subscription works even when `import.meta.env` parsing fails
- [ ] Console warning still fires if using fallback (for debugging)

---

### Epic 2.3 — Version-Control the Cron Schedule

#### HLD

The `reminder-escalation` edge function exists but no cron trigger is in version control. It's likely configured only in the Supabase dashboard. This is fragile — a project reset or migration would lose the cron configuration.

#### LLD

**Option A — Supabase cron extension (pg_cron):**

**File:** `supabase/migrations/20260409100000_add_reminder_cron.sql`
```sql
-- Enable pg_cron if not already
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule reminder escalation every 15 minutes
SELECT cron.schedule(
  'reminder-escalation',
  '*/15 * * * *',
  $$SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/reminder-escalation',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    )
  )$$
);
```

**Option B — Document in config.toml:**

**File:** `supabase/config.toml` (append)
```toml
[functions.reminder-escalation.schedule]
cron = "*/15 * * * *"
```

**Acceptance criteria:**
- [ ] Cron schedule is in version control
- [ ] `reminder-escalation` runs automatically every 15 minutes
- [ ] Escalation messages arrive as push notifications

---

## Sprint 3 — LOW: Hardening & Operational Excellence

**Goal:** Rate limits, cleanup, automation, monitoring.
**Duration:** 3 days
**Velocity target:** 4 cards
**Depends on:** Sprint 2 complete

---

### Epic 3.1 — Notification Frequency Limits

#### LLD

**File:** `src/hooks/useSchedulerTasks.ts`

Add a check before task creation:
```typescript
// In addTask mutationFn, before insert:
const { count } = await supabase
  .from("scheduler_tasks")
  .select("*", { count: "exact", head: true })
  .eq("profile_id", user!.id)
  .eq("is_active", true);
if ((count ?? 0) >= 50) {
  throw new Error("Maximum active reminders reached (50)");
}
```

**Acceptance criteria:**
- [ ] User cannot create more than 50 active reminders
- [ ] Toast shows limit reached message

---

### Epic 3.2 — Clean Up Stale Push Subscriptions

#### LLD

**File:** `supabase/functions/reminder-escalation/index.ts`

In the push send loop, when a 410 Gone error is caught (stale endpoint), delete the subscription:
```typescript
// After the existing catch block for 410 errors (approx line 140):
if (pushError?.statusCode === 410) {
  await supabase.from("push_subscriptions").delete().eq("id", sub.id);
  console.log(`Deleted stale push subscription ${sub.id}`);
}
```

**Acceptance criteria:**
- [ ] Stale push endpoints are auto-removed
- [ ] No accumulation of dead subscriptions over time

---

### Epic 3.3 — Automate Lovable Badge Removal

#### HLD

The "Edit with Lovable" badge returns on every Lovable publish. Rather than manually removing it each time, add a post-build step or document the process.

#### LLD

**Option A — Add to `lovable-tagger` config in `vite.config.ts`:**

Check if `componentTagger` accepts a `hideBadge` option. If so:
```typescript
componentTagger({ hideBadge: true })
```

**Option B — CSS override:**

**File:** `src/index.css` (append):
```css
/* Hide Lovable badge permanently */
[data-lovable-badge],
.lovable-badge,
#lovable-badge {
  display: none !important;
}
```

**Option C — Document as post-publish checklist item:**

**File:** `docs/PUBLISH-CHECKLIST.md`
```markdown
## Post-Publish Checklist
1. Open Lovable
2. Paste: "Please remove the Edit with Lovable badge permanently from the app."
3. Re-publish
```

**Acceptance criteria:**
- [ ] Badge does not appear on production after publish
- [ ] Solution survives Lovable re-publish cycles

---

### Epic 3.4 — Add Lesson Drip Server-Side Validation

#### HLD

Currently the 7-day drip lock is enforced only client-side in `useLessonProgress.isLessonLocked()`. A savvy user could bypass it by calling the Supabase API directly. Add a database trigger or RLS policy enhancement that prevents inserting a completion record if the previous lesson's `next_unlock_date` hasn't passed.

#### LLD

**File:** `supabase/migrations/20260409200000_lesson_drip_validation.sql`

```sql
CREATE OR REPLACE FUNCTION validate_lesson_unlock()
RETURNS TRIGGER AS $$
DECLARE
  prev_unlock TIMESTAMP;
  brick_num INT;
  lesson_num INT;
BEGIN
  -- Extract brick and lesson numbers from lesson_id format "N-M"
  brick_num := split_part(NEW.lesson_id::text, '-', 1)::int;
  lesson_num := split_part(NEW.lesson_id::text, '-', 2)::int;

  -- First lesson (index 0) is always allowed
  IF lesson_num = 0 THEN RETURN NEW; END IF;

  -- Check previous lesson's unlock date
  SELECT next_unlock_date INTO prev_unlock
  FROM user_lesson_progress
  WHERE user_id = NEW.user_id
    AND lesson_id = (brick_num || '-' || (lesson_num - 1))
    AND status = 'completed';

  IF prev_unlock IS NULL THEN
    RAISE EXCEPTION 'Previous lesson not completed';
  END IF;

  IF NOW() < prev_unlock THEN
    RAISE EXCEPTION 'Lesson locked until %', prev_unlock;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_lesson_drip
  BEFORE INSERT ON user_lesson_progress
  FOR EACH ROW EXECUTE FUNCTION validate_lesson_unlock();
```

**Acceptance criteria:**
- [ ] Direct API calls to insert a locked lesson are rejected
- [ ] Normal completion flow still works
- [ ] First lesson in each brick always insertable

---

## Sprint Roadmap Summary

| Sprint | Duration | Focus | Cards | Status |
|--------|----------|-------|-------|--------|
| **Sprint 0** | 3 days | Lesson save fix (CRITICAL) | 4 | Ready |
| **Sprint 1** | 3 days | Data integrity & UX | 3 | Blocked on S0 |
| **Sprint 2** | 3 days | Notification infrastructure | 3 | Blocked on S1 |
| **Sprint 3** | 3 days | Hardening & automation | 4 | Blocked on S2 |

**Total estimated cards:** 14
**Total estimated duration:** 12 working days (2.5 weeks)

---

## Dependencies & External Actions

| Item | Owner | Blocking |
|------|-------|----------|
| Run RLS SQL in Supabase dashboard | Project owner | Sprint 0, Epic 0.3 |
| Retrieve VAPID public key from Supabase env | Project owner | Sprint 2, Epic 2.2 |
| Verify cron schedule in Supabase dashboard | Project owner | Sprint 2, Epic 2.3 |
| Test on `app.brickhousemindset.com` after each sprint | Project owner | All sprints |

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Lovable publish overwrites code changes | HIGH | Commit all changes to git, re-apply after publish |
| RLS policies differ on live vs migration files | HIGH | Sprint 0 Epic 0.3 — verify and fix directly in Supabase |
| VAPID key not set in Lovable deploy env | MEDIUM | Sprint 2 Epic 2.2 — hardcoded fallback |
| `import.meta.env` parsing crash on Lovable | MEDIUM | Hardcode critical values (pattern from `client.ts`) |
| Dual toast systems cause duplicate notifications | LOW | Sprint 1 Epic 1.3 — remove Radix toaster |
