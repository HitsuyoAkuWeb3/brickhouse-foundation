import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supaUrl = process.env.VITE_SUPABASE_URL;
const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supaUrl, supaKey);

async function check() {
  const { data: bData, error: bError } = await supabase.from('bricks').select('*').limit(3);
  if (bError) console.error("Bricks Error:", bError);
  console.log("Bricks:", bData?.length ? bData.map(b => b.title) : "Empty");
  
  const { data: aData, error: aError } = await supabase.from('affirmations').select('*').limit(3);
  if (aError) console.error("Affirmations Error:", aError);
  console.log("Affirmations:", aData?.length ? aData.map(a => a.audio_url) : "Empty");
}
check();
