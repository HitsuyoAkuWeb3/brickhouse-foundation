import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://vtufpmuhtonoyerzmyqh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0dWZwbXVodG9ub3llcnpteXFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4Njk0MTYsImV4cCI6MjA4OTQ0NTQxNn0.LuIBfXDVSIycGepKxXdkZ0A2DIkLKRL_PLHJ5eJIVC8";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function main() {
  const { data, error } = await supabase.from('affirmations').select('brick_id, text, audio_url');
  if (error) {
    console.error(error);
  } else {
    console.log(`Found ${data.length} affirmations`);
    const byBrick = {};
    for (const row of Object.values(data)) {
      byBrick[row.brick_id] = (byBrick[row.brick_id] || 0) + 1;
    }
    console.log('Count by brick_id:', byBrick);
    console.log('Sample rows:', data.slice(0, 3));
  }
}
main();
