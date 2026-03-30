import { createClient } from '@supabase/supabase-js';

try {
  const supabase = createClient("https://vtufpmuhtonoyerzmyqh.supabase.co", "sb_publishable_E1XRUxHh0NOuboqkrOnjVQ_K3F0ZJd_");
  console.log("Success, it didn't crash.");
} catch (error) {
  console.error("Crashed:", error);
}
