import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
const supabaseUrl = "https://gqovcknsttvizbscfehy.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdxb3Zja25zdHR2aXpic2NmZWh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwOTI0NTMsImV4cCI6MjA4MTY2ODQ1M30.51_BvsOV8PC6PcKDShjkB4ZxUoz1rsVuqcEjvAXZrmA";
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})