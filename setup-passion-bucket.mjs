import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function setup() {
  console.log("Setting up passion-picks bucket...");
  const { data: bData, error: bError } = await supabase.storage.createBucket('passion-picks', {
    public: true,
    fileSizeLimit: 52428800, // 50MB
    allowedMimeTypes: ['image/*', 'video/*']
  });

  if (bError && bError.message !== 'The resource already exists') {
    console.error("Bucket creation error:", bError);
  } else {
    console.log("Bucket ready.");
  }

  await supabase.storage.updateBucket('passion-picks', { public: true });

  console.log("Applying Storage RLS Policies...");
  const { error: rlsError } = await supabase.rpc('setup_passion_picks_storage_policy');
  
  if (rlsError && !rlsError.message.includes('function "setup_passion_picks_storage_policy" does not exist')) {
     console.error("RLS Error:", rlsError);
  } else if (rlsError) {
     // If the RPC doesn't exist, we will execute an SQL block directly!
     console.log("We need to add storage RLS natively, one moment.");
  }
}

setup();

