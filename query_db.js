import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config()

const supaUrl = process.env.VITE_SUPABASE_URL;
const supaKey = process.env.VITE_SUPABASE_ANON_KEY;

if(!supaUrl || !supaKey) {
  console.log("Missing env vars!");
  process.exit(1);
}

const supabase = createClient(supaUrl, supaKey);

async function checkAudio() {
  const { data, error } = await supabase.from('affirmations').select('id, audio_url, category').limit(10);
  console.log("Affirmations:", data);

  const { data: bData, error: bError } = await supabase.from('bricks').select('*').limit(3);
  console.log("Bricks:", bData?.length ? "Exists" : "Empty");
}

checkAudio();
