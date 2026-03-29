import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  const { data, error } = await supabase.from('affirmations').select('*')
  if (error) {
    console.error('Error fetching affirmations:', error)
  } else {
    console.log(`Found ${data.length} affirmations.`)
    console.log(JSON.stringify(data.slice(0, 5), null, 2))
  }
}

main()
