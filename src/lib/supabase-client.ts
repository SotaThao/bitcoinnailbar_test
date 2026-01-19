/**
 * Singleton Supabase Client
 * Prevents "Multiple GoTrueClient instances" warning
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      `https://${projectId}.supabase.co`,
      publicAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      }
    );
    
    console.log('✅ [SUPABASE] Client initialized');
  }
  
  return supabaseInstance;
}

// Export singleton instance
export const supabase = getSupabaseClient();
