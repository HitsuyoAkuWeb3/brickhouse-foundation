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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { date, userId } = await req.json();

    if (!date || !userId) {
      throw new Error("Missing date or userId");
    }

    // Identify profile to determine what specific ritual to generate
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("transformation_choice")
      .eq("id", userId)
      .single();

    const track = profile?.transformation_choice || "default";

    // Insert new daily ritual
    const { data, error } = await supabaseClient
      .from("daily_rituals")
      .insert({
        user_id: userId,
        ritual_date: date,
        morning_affirmation: false,
        midday_checkin: false,
        evening_reflection: false,
        joy_moment: null,
        gratitude_note: null,
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ ritual: data, track }), {
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
