import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function getZodiacSign(birthDate: string): { sign: string; element: string; rulingPlanet: string } {
  const d = new Date(birthDate);
  const month = d.getMonth() + 1;
  const day = d.getDate();

  const signs = [
    { sign: "Capricorn", element: "Earth", planet: "Saturn", start: [1, 1], end: [1, 19] },
    { sign: "Aquarius", element: "Air", planet: "Uranus", start: [1, 20], end: [2, 18] },
    { sign: "Pisces", element: "Water", planet: "Neptune", start: [2, 19], end: [3, 20] },
    { sign: "Aries", element: "Fire", planet: "Mars", start: [3, 21], end: [4, 19] },
    { sign: "Taurus", element: "Earth", planet: "Venus", start: [4, 20], end: [5, 20] },
    { sign: "Gemini", element: "Air", planet: "Mercury", start: [5, 21], end: [6, 20] },
    { sign: "Cancer", element: "Water", planet: "Moon", start: [6, 21], end: [7, 22] },
    { sign: "Leo", element: "Fire", planet: "Sun", start: [7, 23], end: [8, 22] },
    { sign: "Virgo", element: "Earth", planet: "Mercury", start: [8, 23], end: [9, 22] },
    { sign: "Libra", element: "Air", planet: "Venus", start: [9, 23], end: [10, 22] },
    { sign: "Scorpio", element: "Water", planet: "Pluto", start: [10, 23], end: [11, 21] },
    { sign: "Sagittarius", element: "Fire", planet: "Jupiter", start: [11, 22], end: [12, 21] },
    { sign: "Capricorn", element: "Earth", planet: "Saturn", start: [12, 22], end: [12, 31] },
  ];

  for (const s of signs) {
    const afterStart = month > s.start[0] || (month === s.start[0] && day >= s.start[1]);
    const beforeEnd = month < s.end[0] || (month === s.end[0] && day <= s.end[1]);
    if (afterStart && beforeEnd) {
      return { sign: s.sign, element: s.element, rulingPlanet: s.planet };
    }
  }
  return { sign: "Capricorn", element: "Earth", rulingPlanet: "Saturn" };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { birth_date, transformation_choice, goals, name } = await req.json();

    if (!birth_date) {
      return new Response(JSON.stringify({ error: "Birth date is required for your Goddess Rx." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { sign, element, rulingPlanet } = getZodiacSign(birth_date);

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
