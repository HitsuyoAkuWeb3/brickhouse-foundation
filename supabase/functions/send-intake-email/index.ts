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
    const { formData } = payload

    if (!formData || !formData.email) {
      return new Response(JSON.stringify({ error: 'Missing formData payload' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const MAILCHIMP_API_KEY = Deno.env.get('MAILCHIMP_API_KEY')
    if (!MAILCHIMP_API_KEY) {
      console.log('MAILCHIMP_API_KEY missing, skipping email send but returning success for demo.')
      return new Response(JSON.stringify({ success: true, simulated: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Build email content
    const htmlContent = `
      <h2>New Coaching Intake Request</h2>
      <p><strong>Name:</strong> ${formData.full_name}</p>
      <p><strong>Email:</strong> ${formData.email}</p>
      <p><strong>Phone:</strong> ${formData.phone || 'N/A'}</p>
      <p><strong>Location:</strong> ${formData.location || 'N/A'}</p>
      
      <h3>Current Situation</h3>
      <p><strong>Life Stage:</strong> ${formData.life_stage?.join(', ') || 'None selected'}</p>
      <p><strong>#1 Obstacle:</strong> ${formData.obstacle || 'N/A'}</p>
      <p><strong>Out of Alignment:</strong> ${formData.out_of_alignment?.join(', ') || 'None selected'}</p>
      <p><strong>Urgency (1-10):</strong> ${formData.urgency || '5'}</p>
      
      <h3>Goals & Readiness</h3>
      <p><strong>Ideal Life (12 mo):</strong> ${formData.ideal_life || 'N/A'}</p>
      <p><strong>Specific Results:</strong> ${formData.specific_results?.join(', ') || 'None selected'}</p>
      <p><strong>Prior Coaching:</strong> ${formData.prior_coaching || 'N/A'}</p>
      
      <h3>Investment</h3>
      <p><strong>Interested In:</strong> ${formData.interested_experience || 'N/A'}</p>
      <p><strong>Comfort Zone:</strong> ${formData.investment_comfort || 'N/A'}</p>
      <p><strong>How Ready:</strong> ${formData.readiness || 'N/A'}</p>
      
      <h3>Additional Details</h3>
      <p><strong>Discovery Source:</strong> ${formData.discovery_source || 'N/A'}</p>
      <p><strong>Additional Info:</strong> ${formData.additional_info || 'N/A'}</p>
      <p><strong>Connection Preference:</strong> ${formData.connect_preference || 'N/A'}</p>
    `

    // Use Mailchimp Transactional API (Mandrill)
    const mandrillRes = await fetch('https://mandrillapp.com/api/1.0/messages/send.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: MAILCHIMP_API_KEY,
        message: {
          from_email: "onboarding@brickhousemindset.com", 
          from_name: "Brickhouse System",
          to: [
            {
              email: "che@brickhousemindset.com",
              type: "to"
            }
          ],
          subject: `New Coaching Intake: ${formData.full_name}`,
          html: htmlContent
        }
      })
    })

    if (!mandrillRes.ok) {
      const errorText = await mandrillRes.text();
      console.error('Mailchimp/Mandrill error:', errorText);
      throw new Error(`Failed to send email via Mailchimp Transactional: ${errorText}`);
    }

    const responseData = await mandrillRes.json();
    if (responseData[0]?.status === 'rejected' || responseData[0]?.status === 'invalid') {
       console.error('Mailchimp/Mandrill rejected:', responseData);
       throw new Error(`Email rejected by Mailchimp: ${responseData[0]?.reject_reason || 'Unknown error'}`);
    }

    return new Response(JSON.stringify({ success: true, detail: responseData }), {
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
