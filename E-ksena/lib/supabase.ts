import { createClient } from '@supabase/supabase-js';

// Replace these with the values from your Supabase Dashboard 
// (Project Settings > API)
const supabaseUrl = 'https://your-project-id.supabase.co';
const supabaseAnonKey = 'your-public-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);