import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function getZodiacDetails(signName: string): { sign: string; element: string; rulingPlanet: string } {
  const signs = [
    { sign: "Capricorn", element: "Earth", planet: "Saturn" },
    { sign: "Aquarius", element: "Air", planet: "Uranus" },
    { sign: "Pisces", element: "Water", planet: "Neptune" },
    { sign: "Aries", element: "Fire", planet: "Mars" },
    { sign: "Taurus", element: "Earth", planet: "Venus" },
    { sign: "Gemini", element: "Air", planet: "Mercury" },
    { sign: "Cancer", element: "Water", planet: "Moon" },
    { sign: "Leo", element: "Fire", planet: "Sun" },
    { sign: "Virgo", element: "Earth", planet: "Mercury" },
    { sign: "Libra", element: "Air", planet: "Venus" },
    { sign: "Scorpio", element: "Water", planet: "Pluto" },
    { sign: "Sagittarius", element: "Fire", planet: "Jupiter" },
  ];

  const found = signs.find(s => s.sign.toLowerCase() === signName.toLowerCase());
  if (found) {
    return { sign: found.sign, element: found.element, rulingPlanet: found.planet };
  }
  return { sign: "Unknown", element: "Unknown", rulingPlanet: "Unknown" };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let { zodiac_sign, transformation_choice, goals, name, generate, user_id } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // If user_id is provided (like from Onboarding background trigger), fetch their details
    if (user_id) {
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("zodiac_sign, transformation_choice, goals, full_name")
        .eq("id", user_id)
        .single();
        
      if (profile) {
        zodiac_sign = profile.zodiac_sign || zodiac_sign;
        transformation_choice = profile.transformation_choice || transformation_choice;
        goals = profile.goals || goals;
        name = profile.full_name || name;
      }
    }

    if (!zodiac_sign && !generate) {
      return new Response(JSON.stringify({ error: "Zodiac sign is required for your Goddess Rx." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { sign, element, rulingPlanet } = getZodiacDetails(zodiac_sign || "Aries");

    const systemPrompt = `You are a mystical spiritual advisor for the Brickhouse Mindset platform — a luxury personal development brand for women building their dream lives.

Generate a personalized "Goddess Prescription" based on the user's zodiac sign, element, ruling planet, transformation path, and goals.

The prescription should feel like a sacred, luxurious spiritual toolkit curated just for her.

Return structured data using the provided tool.`;

    const userPrompt = `Zodiac Sign: ${sign}
Element: ${element}
Ruling Planet: ${rulingPlanet}
Transformation Path: ${transformation_choice || "general growth"}
Goals: ${goals?.length ? goals.join(", ") : "becoming my best self"}
${name ? `Her name: ${name}` : ""}

Create her Goddess Prescription with:
- 3 crystals (name + why it's perfect for her)
- 3 power colors (name + hex code + spiritual meaning for her)
- 3 spiritual tools/practices (name + how to use it)
- 1 personal mantra (bold, empowering, starts with "I am")`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_prescription",
              description: "Return the Goddess Prescription",
              parameters: {
                type: "object",
                properties: {
                  crystals: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        reason: { type: "string" },
                        emoji: { type: "string" },
                      },
                      required: ["name", "reason"],
                      additionalProperties: false,
                    },
                  },
                  colors: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        hex: { type: "string" },
                        meaning: { type: "string" },
                      },
                      required: ["name", "hex", "meaning"],
                      additionalProperties: false,
                    },
                  },
                  spiritual_tools: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        practice: { type: "string" },
                        emoji: { type: "string" },
                      },
                      required: ["name", "practice"],
                      additionalProperties: false,
                    },
                  },
                  mantra: { type: "string" },
                },
                required: ["crystals", "colors", "spiritual_tools", "mantra"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_prescription" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const body = await response.text();
      console.error("AI gateway error:", status, body);
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    let prescription;
    if (toolCall?.function?.arguments) {
      prescription = JSON.parse(toolCall.function.arguments);
    } else {
      const content = data.choices?.[0]?.message?.content || "{}";
      prescription = JSON.parse(content);
    }

    // Save to DB if we have a user_id
    if (user_id) {
      await supabaseClient.from("goddess_prescriptions").insert({
        profile_id: user_id,
        prescription_data: {
          zodiac_sign: sign,
          element,
          ruling_planet: rulingPlanet,
          crystals: prescription.crystals,
          colors: prescription.colors,
          spiritual_tools: prescription.spiritual_tools,
          mantra: prescription.mantra,
        },
      });
    }

    return new Response(
      JSON.stringify({
        ...prescription,
        zodiac_sign: sign,
        element,
        ruling_planet: rulingPlanet,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("goddess-rx error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
