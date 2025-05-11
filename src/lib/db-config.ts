import { createClient } from '@supabase/supabase-js';

// Connection configuration
const DB_CONFIG = {
  TIMEOUT: 15000, // 15 second timeout
  MAX_RETRIES: 3,
  RETRY_DELAYS: [1000, 3000, 5000], // Progressive backoff
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes cache
  BATCH_SIZE: 50 // For pagination
};

// Initialize Supabase client with robust configuration
export const createDbClient = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase credentials');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: {
        getItem: (key) => {
          try {
            return localStorage.getItem(key);
          } catch {
            return null;
          }
        },
        setItem: (key, value) => {
          try {
            localStorage.setItem(key, value);
          } catch {
            console.warn('Failed to save auth state');
          }
        },
        removeItem: (key) => {
          try {
            localStorage.removeItem(key);
          } catch {
            console.warn('Failed to remove auth state');
          }
        }
      }
    },
    global: {
      headers: { 'x-client-info': 'supabase-js' },
      fetch: (url, options = {}) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), DB_CONFIG.TIMEOUT);
        
        return fetch(url, {
          ...options,
          signal: controller.signal,
          keepalive: true,
          cache: 'no-store'
        }).finally(() => clearTimeout(timeoutId));
      }
    },
    db: {
      schema: 'public'
    },
    realtime: {
      params: {
        eventsPerSecond: 2
      }
    }
  });
};

export { DB_CONFIG };