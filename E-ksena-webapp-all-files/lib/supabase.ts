import { createClient } from '@supabase/supabase-js';

// Replace these with the values from your Supabase Dashboard 
// (Project Settings > API)
const supabaseUrl = 'https://cwhduwianpugjbnqzmhs.supabase.co';
const supabaseAnonKey = 'sb_publishable_oaawhfNpHS5iLqjIVTxxsg_VO9_Zwxv';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);