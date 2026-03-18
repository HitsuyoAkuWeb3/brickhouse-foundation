import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // This cron-called function scans rituals today and sends escalations 
    // for users failing to complete their architecture requirements.
    const today = new Date().toISOString().split('T')[0];

    const { data: incompleteRituals, error } = await supabase
      .from("daily_rituals")
      .select(`
        id, user_id, morning_affirmation, evening_reflection,
        profiles ( email, name )
      `)
      .eq("ritual_date", today)
      .or('morning_affirmation.eq.false,evening_reflection.eq.false');

    if (error) throw error;

    // Simulate sending escalated reminder logs
    const notificationsSent = [];
    for (const ritual of incompleteRituals || []) {
      const missingParts = [];
      if (!ritual.morning_affirmation) missingParts.push("Morning Affirmation");
      if (!ritual.evening_reflection) missingParts.push("Evening Reflection");
      
      const email = ritual.profiles?.email || "Unknown Email";
      console.log(`Sending accountability escalation to ${email}: Missing ${missingParts.join(" and ")}`);
      notificationsSent.push({ userId: ritual.user_id, email, missingParts });
    }

    return new Response(JSON.stringify({ success: true, escalated: notificationsSent.length, notificationsSent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
