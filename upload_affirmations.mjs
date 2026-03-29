import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://vtufpmuhtonoyerzmyqh.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const AUDIO_DIR = "/Users/ramajjohnson/Brickhouse Mindset/Brickhouse_Affirmations_Audio";

const folderToSlug = {
  "Brick01_SelfLove": "self-love",
  "Brick02_Mindset": "mindset",
  "Brick03_Goal": "goals",
  "Brick04_Accountability": "accountability",
  "Brick05_Healing": "healing",
  "Brick06_Body": "body",
  "Brick07_Relationships": "relationships",
  "Brick08_Dating": "dating",
  "Brick09_Narcissism": "narcissism",
  "Brick10_Marriage": "marriage",
  "Brick11_Life": "wisdom",
  "Brick12_Spiritual": "spiritual"
};

async function run() {
  console.log("Fetching bricks mapping from DB...");
  const { data: bricks, error: bricksErr } = await supabase.from('bricks').select('id, slug');
  if (bricksErr) {
    console.error("Error fetching bricks:", bricksErr);
    return;
  }
  
  const slugToUuid = {};
  if (bricks && bricks.length > 0) {
    for (const b of bricks) {
      slugToUuid[b.slug] = b.id;
    }
  } else {
    console.warn("No bricks found in DB! Checking if it still allows insertion...");
  }

  // 1. Ensure bucket exists
  console.log("Ensuring affirmations bucket exists...");
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  if (bucketError) {
    console.error("Error listing buckets:", bucketError);
    return;
  }
  
  if (!buckets.find(b => b.name === 'affirmations')) {
    console.log("Creating affirmations bucket...");
    const { error: createError } = await supabase.storage.createBucket('affirmations', { public: true });
    if (createError) {
      console.error("Error creating bucket:", createError);
      return;
    }
  } else {
    // Make sure it's public
    await supabase.storage.updateBucket('affirmations', { public: true });
    console.log("Affirmations bucket verified public.");
  }

  // 2. Iterate folders using explicit array to bypass MacOS folder read limits
  const categories = Object.keys(folderToSlug);
  let totalFiles = 0;
  
  for (const cat of categories) {
    const slug = folderToSlug[cat];
    const brickUuid = slugToUuid[slug];
    
    const catPath = path.join(AUDIO_DIR, cat);
    if (!fs.existsSync(catPath) || !fs.statSync(catPath).isDirectory()) {
      console.log(`Skipping non-existent directory ${catPath}`);
      continue;
    }
    
    const files = fs.readdirSync(catPath).filter(f => f.endsWith('.mp3'));
    
    for (const file of files) {
      const filePath = path.join(catPath, file);
      const fileBuffer = fs.readFileSync(filePath);
      
      const storagePath = `${cat}/${file}`;
      
      console.log(`Uploading ${storagePath}...`);
      
      const { error: uploadError } = await supabase.storage
        .from('affirmations')
        .upload(storagePath, fileBuffer, {
          contentType: 'audio/mpeg',
          upsert: true
        });
        
      if (uploadError) {
        console.error(`Failed to upload ${file}:`, uploadError);
        continue;
      }
      
      const { data: publicUrlData } = supabase.storage
        .from('affirmations')
        .getPublicUrl(storagePath);
        
      const audioUrl = publicUrlData.publicUrl;
      const textTitle = file.replace('.mp3', '').replace(/_/g, ' ');
      
      // Check if it exists so we don't duplicate on re-run
      const { data: existing } = await supabase.from('affirmations')
        .select('id')
        .eq('audio_url', audioUrl)
        .maybeSingle();
        
      if (existing) {
        console.log(`Affirmation for ${file} already exists, skipping DB insert`);
        totalFiles++;
        continue;
      }
      
      // Insert into database
      const { error: dbError } = await supabase.from('affirmations').insert({
        text: `Audio Affirmation: ${textTitle}`,
        brick_id: brickUuid || null, 
        category: cat,
        audio_url: audioUrl,
        affirmation_type: "audio"
      });
      
      if (dbError) {
        console.error(`Failed to insert record for ${file}:`, dbError);
      } else {
        console.log(`Successfully saved ${file} to DB`);
        totalFiles++;
      }
    }
  }
  
  console.log(`\nUpload complete! Successfully processed ${totalFiles} audio files.`);
}

run();
