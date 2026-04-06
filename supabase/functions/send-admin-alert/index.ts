import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    const { type, data } = payload
    
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    if (!RESEND_API_KEY) {
      console.log('RESEND_API_KEY missing, skipping email send.')
      return new Response(JSON.stringify({ success: true, simulated: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    let subject = 'New Admin Alert'
    let htmlContent = '<h2>New Alert</h2>'

    if (type === 'life_audit') {
      subject = 'New Life Audit Completed'
      htmlContent = `
        <h2>Life Audit Results</h2>
        <p><strong>Self:</strong> ${data.self}</p>
        <p><strong>Love:</strong> ${data.love}</p>
        <p><strong>Money:</strong> ${data.money}</p>
        <p><strong>Purpose:</strong> ${data.purpose}</p>
        <p><strong>Joy:</strong> ${data.joy}</p>
      `
    } else if (type === 'lead_capture') {
      subject = `New Lead: ${data.name} (${data.variant})`
      htmlContent = `
        <h2>New Lead Captured</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone || 'N/A'}</p>
        <p><strong>Type:</strong> ${data.variant}</p>
      `
    } else if (type === 'contact_form') {
      subject = `New Contact Message from ${data.name}`
      htmlContent = `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Message:</strong></p>
        <p><pre style="white-space: pre-wrap; font-family: sans-serif;">${data.message}</pre></p>
      `
    }

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Brickhouse Alerts <onboarding@resend.dev>', 
        to: ['che@brickhousemindset.com'], 
        subject: subject,
        html: htmlContent,
      }),
    })

    if (!resendRes.ok) {
      const errorText = await resendRes.text();
      console.error('Resend error:', errorText);
      throw new Error(`Failed to send alert: ${errorText}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: unknown) {
    const err = error as Error;
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
