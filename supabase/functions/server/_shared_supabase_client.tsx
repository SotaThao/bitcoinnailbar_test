/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SUPABASE CLIENT SINGLETON
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Single shared Supabase client to prevent connection reset issues
 */

import { createClient, SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import { getEnv } from './_shared_constants.tsx';

let supabaseInstance: SupabaseClient | null = null;

/**
 * Get or create Supabase client singleton
 * 
 * Using singleton pattern to:
 * - Prevent connection reset errors
 * - Reduce connection pool overhead
 * - Improve performance
 */
export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseInstance) {
    const supabaseUrl = getEnv("SUPABASE_URL");
    const supabaseKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
    }

    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      }
    });
  }

  return supabaseInstance;
};

/**
 * Reset singleton (useful for testing)
 */
export const resetSupabaseClient = () => {
  supabaseInstance = null;
};
