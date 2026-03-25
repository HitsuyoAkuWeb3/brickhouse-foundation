import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing credentials");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkBricks() {
  const { data, error } = await supabase.from('bricks').select('*');
  if (error) {
    console.error("Error fetching bricks:", error);
    return;
  }
  console.log("Bricks:", data);
}

checkBricks();
