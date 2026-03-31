import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function check() {
  const { data: affirms, error } = await supabase.from('affirmations').select('*');
  if (error) {
    console.error("Error fetching affirmations:", error);
  } else {
    console.log(`Found ${affirms.length} affirmations in the DB.`);
    if (affirms.length > 0) {
      console.log("Sample affirmation:", affirms[0]);
    }
    
    // Check how many have audio_url
    const withAudio = affirms.filter(a => a.audio_url);
    console.log(`Affirmations with audio_url: ${withAudio.length}`);
    withAudio.forEach(a => console.log(`- ${a.title}: ${a.audio_url}`));
  }
}
check();
