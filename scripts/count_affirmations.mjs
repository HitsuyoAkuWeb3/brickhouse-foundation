import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAudioAffirmations() {
  console.log("Checking affirmations...");
  const { data, error } = await supabase
    .from('affirmations')
    .select('id, audio_url, text, brick_id')
    .not('audio_url', 'is', null);

  if (error) {
    console.error("Error:", error);
    return;
  }
  
  console.log(`Total audio affirmations in DB: ${data.length}`);
  
  // Group by brick_id
  const byBrick = {};
  data.forEach(aff => {
    byBrick[aff.brick_id] = (byBrick[aff.brick_id] || 0) + 1;
  });
  
  console.log("Audio affirmations per brick ID:");
  for (const [brick, count] of Object.entries(byBrick)) {
    console.log(`Brick ${brick}: ${count} audio affirmations`);
  }
}

checkAudioAffirmations();
