import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const AUDIO_DIR = path.join(process.cwd(), "public/audio/affirmations");

const folderToSlug = {
  "Brick01_SelfLove": "self-love-identity",
  "Brick02_Mindset": "mindset-manifestation",
  "Brick03_Goal": "goal-achievement",
  "Brick04_Accountability": "accountability",
  "Brick05_Healing": "healing-emotional-wellness",
  "Brick06_Body": "body-health",
  "Brick07_Relationships": "relationships-general",
  "Brick08_Dating": "dating-partner-selection",
  "Brick09_Narcissism": "narcissism-red-flags",
  "Brick10_Marriage": "marriage-partnership",
  "Brick11_Life": "life-wisdom-peace",
  "Brick12_Spiritual": "spiritual-alignment"
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
    console.warn("No bricks found in DB! Cannot map brick IDs.");
  }

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
      const localAudioUrl = `/audio/affirmations/${cat}/${file}`;
      // Clean up text title, e.g. Brick01_Aff01 -> Brick 01 Aff 01
      const textTitle = file.replace('.mp3', '').replace(/_/g, ' ');
      
      const { data: existing } = await supabase.from('affirmations')
        .select('id, audio_url')
        .eq('audio_url', localAudioUrl)
        .maybeSingle();
        
      if (existing) {
        console.log(`Affirmation for ${file} already exists, skipping insert.`);
        totalFiles++;
        continue;
      }
      
      // Try resolving by text (in case it existed without audio_url)
      const { data: existingByText } = await supabase.from('affirmations')
        .select('id')
        .eq('text', `Audio Affirmation: ${textTitle}`)
        .maybeSingle();

      if (existingByText) {
         // Update existing text matching affirmation with the new URL
         const { error: updateError } = await supabase.from('affirmations')
           .update({ audio_url: localAudioUrl, brick_id: brickUuid || null, category: cat })
           .eq('id', existingByText.id);
           
         if (!updateError) {
             console.log(`Updated existing DB record for ${file} with local audio_url.`);
             totalFiles++;
         }
         continue;
      }
      
      // Insert into database
      const { error: dbError } = await supabase.from('affirmations').insert({
        text: `Audio Affirmation: ${textTitle}`,
        brick_id: brickUuid || null, 
        category: cat,
        audio_url: localAudioUrl,
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
  
  console.log(`\nSync complete! Successfully mapped ${totalFiles} audio files locally.`);
}

run();
