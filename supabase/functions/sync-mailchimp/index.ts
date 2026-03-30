/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

const MAILCHIMP_API_KEY = Deno.env.get("MAILCHIMP_API_KEY") ?? "";
const MAILCHIMP_LIST_ID = Deno.env.get("MAILCHIMP_LIST_ID") ?? "";
const MAILCHIMP_SERVER_PREFIX = MAILCHIMP_API_KEY.split("-").pop() ?? "";

interface WebhookPayload {
  type: string;
  table: string;
  schema: string;
  record: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
  old_record: null | any;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  if (!MAILCHIMP_API_KEY || !MAILCHIMP_LIST_ID) {
    console.error("[sync-mailchimp] Missing MAILCHIMP_API_KEY or MAILCHIMP_LIST_ID secrets");
    return new Response(JSON.stringify({ error: "Mailchimp not configured" }), { 
      status: 500, 
      headers: { "Content-Type": "application/json" } 
    });
  }

  try {
    const payload = (await req.json()) as WebhookPayload;

    // Only process inserts to the profiles table
    if (payload.type !== "INSERT" || payload.table !== "profiles") {
      return new Response(JSON.stringify({ message: "Ignored event type or table" }), { 
        status: 200, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    const { email, first_name, last_name } = payload.record;

    if (!email) {
      console.error("[sync-mailchimp] No email found in record");
      return new Response(JSON.stringify({ error: "Email is required" }), { 
        status: 400, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    const subscriberHash = await md5Hash(email.toLowerCase().trim());
    const url = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members/${subscriberHash}`;

    // Add or update the subscriber
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Basic ${btoa(`anystring:${MAILCHIMP_API_KEY}`)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
        status_if_new: "subscribed",
        merge_fields: {
          FNAME: first_name || "",
          LNAME: last_name || "",
        },
        tags: ["Signup"],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("[sync-mailchimp] Mailchimp API error:", errorData);
      return new Response(JSON.stringify({ error: "Mailchimp sync failed", detail: errorData }), { 
        status: 502, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    console.log(`[sync-mailchimp] Successfully synced ${email}`);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });

  } catch (error) {
    console.error("[sync-mailchimp] Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { 
      status: 500, 
      headers: { "Content-Type": "application/json" } 
    });
  }
});

async function md5Hash(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("MD5", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
