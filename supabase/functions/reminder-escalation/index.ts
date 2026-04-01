import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── Blueprint §5.2 #12: 3-Level Escalation on scheduler_tasks ───────────────
//
// Escalation Protocol:
//   Level 1 → Gentle nudge ("Hey, you've got a pending task")
//   Level 2 → Firm follow-up ("You haven't completed this yet — don't let it slide")
//   Level 3 → Final call + fires `task_abandoned` analytics event
//
// Snooze Integration:
//   snooze_interval = 'every_minute' → re-fires every cron cycle
//   snooze_interval = 'every_hour'  → re-fires if last_reminded_at > 1 hour ago
//   snooze_interval = 'none'        → standard escalation only
//
// This function is designed to be called via Supabase cron (pg_cron) or
// an external scheduler (e.g., Vercel Cron, GitHub Actions).

const ESCALATION_MESSAGES = [
  "Hey Brickhouse — you've got a pending task. Let's keep building. 🧱",
  "This task is still waiting on you. Don't let it slide. Your future self needs this done. 💪",
  "Final call — this task has been sitting too long. Complete it or let it go. No in-between. 🔥",
];

const MAX_ESCALATION = 3;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const now = new Date();

    // ─── 1. Fetch active, incomplete tasks that have reminders ────────────────
    const { data: pendingTasks, error } = await supabase
      .from("scheduler_tasks")
      .select("id, profile_id, title, category, task_type, escalation_level, snooze_interval, reminder_count, last_reminded_at, time_of_day, created_at")
      .eq("is_active", true)
      .eq("is_completed", false)
      .not("reminder_type", "is", null);

    if (error) throw error;

    const escalated: Array<{
      taskId: string;
      profileId: string;
      title: string;
      level: number;
      message: string;
      abandoned: boolean;
    }> = [];

    for (const task of pendingTasks || []) {
      const currentLevel = task.escalation_level || 1;
      const snooze = task.snooze_interval || "none";
      const lastReminded = task.last_reminded_at ? new Date(task.last_reminded_at) : null;

      // ─── Snooze gating ───────────────────────────────────────────────────
      // If snooze is active, check if enough time has passed
      if (lastReminded) {
        const msSinceLastReminder = now.getTime() - lastReminded.getTime();
        if (snooze === "every_hour" && msSinceLastReminder < 60 * 60 * 1000) continue;
        // 'every_minute' always fires (cron cycle is ≥ 1 min)
        // 'none' — proceed with standard escalation cadence
        if (snooze === "none" && msSinceLastReminder < 4 * 60 * 60 * 1000) continue; // 4hr between standard escalations
      }

      // ─── Escalate ────────────────────────────────────────────────────────
      const newLevel = Math.min(currentLevel + 1, MAX_ESCALATION);
      const isAbandoned = newLevel >= MAX_ESCALATION && snooze === "none";
      const message = ESCALATION_MESSAGES[newLevel - 1] || ESCALATION_MESSAGES[2];

      // Update the task
      await supabase
        .from("scheduler_tasks")
        .update({
          escalation_level: newLevel,
          reminder_count: (task.reminder_count || 0) + 1,
          last_reminded_at: now.toISOString(),
          // If snooze is 'none' and we hit max, deactivate
          ...(isAbandoned ? { is_active: false } : {}),
        })
        .eq("id", task.id);

      // ─── Fire analytics event ────────────────────────────────────────────
      const eventType = isAbandoned ? "task_abandoned" : "reminder_sent";
      await supabase.from("analytics_events").insert({
        user_id: task.profile_id,
        event_type: eventType,
        event_data: {
          task_id: task.id,
          task_title: task.title,
          category: task.category,
          task_type: task.task_type,
          escalation_level: newLevel,
          snooze_interval: snooze,
          reminder_count: (task.reminder_count || 0) + 1,
        },
      });

      escalated.push({
        taskId: task.id,
        profileId: task.profile_id,
        title: task.title,
        level: newLevel,
        message,
        abandoned: isAbandoned,
      });

      console.log(
        `[${eventType}] "${task.title}" → Level ${newLevel} (${snooze}) for profile ${task.profile_id}`
      );
    }

    const abandoned = escalated.filter((e) => e.abandoned).length;

    return new Response(
      JSON.stringify({
        success: true,
        processed: escalated.length,
        abandoned,
        escalated,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Reminder escalation error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
