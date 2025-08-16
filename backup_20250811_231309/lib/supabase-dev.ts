import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Development-only Supabase client that bypasses RLS
// This uses the service role key which has full database access

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if we're in development and have a service key
const isDevelopment = process.env.NODE_ENV === 'development';
const hasServiceKey = supabaseServiceKey && supabaseServiceKey !== 'your-service-role-key-here-if-needed';

// Create the appropriate client
export const supabase = createClient<Database>(
  supabaseUrl,
  // Use service key in dev if available (bypasses ALL RLS)
  isDevelopment && hasServiceKey ? supabaseServiceKey : supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: !hasServiceKey,
      persistSession: !hasServiceKey,
      detectSessionInUrl: !hasServiceKey
    }
  }
);

// Export a flag so components know if RLS is bypassed
export const isRLSBypassed = isDevelopment && hasServiceKey;

// Log the mode we're running in
if (typeof window !== 'undefined') {
  // console.log(
    // `🔐 Supabase Mode: ${
      // isRLSBypassed
        // ? '🚀 Development (RLS Bypassed)'
        // : '🛡️ Production (RLS Active)'
    // }`
  // );
}