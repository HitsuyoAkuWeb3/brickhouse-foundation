import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.from('affirmations').select('brick_id, text, audio_url');
  if (error) {
    console.error(error);
  } else {
    console.log(`Found ${data.length} affirmations`);
    const byBrick: Record<string, number> = {};
    for (const row of Object.values(data)) {
      byBrick[row.brick_id] = (byBrick[row.brick_id] || 0) + 1;
    }
    console.log('Count by brick_id:', byBrick);
    console.log('Sample rows:', data.slice(0, 3));
  }
}
main();
