import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { event_type, user_id, event_data } = await req.json()

    console.log(`Processing behavioral event: ${event_type} for user: ${user_id}`)

    // Behavioral Insight Logic based on Blueprint:
    // If a user drops off or breaks a streak, we can flag them or generate an insight
    if (event_type === 'ritual_abandoned' || event_type === 'streak_broken') {
       console.log("Insight generated: High risk of churn. Re-engagement needed.")
       // Here you could send an email via SendGrid or insert an 'escalation' reminder
    }

    if (event_type === 'brick_completed') {
       console.log("Insight generated: Positive momentum.")
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Behavioral insight processed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: err }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
