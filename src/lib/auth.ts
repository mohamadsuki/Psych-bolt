import { supabase } from './supabase';
import { isNetworkError } from './db-utils';

// Type definition for Therapist
export interface Therapist {
  id: string;
  name: string;
  code: string;
  is_admin?: boolean;
}

// Retry configuration
const RETRY_COUNT = 3;
const INITIAL_DELAY = 1000; // 1 second

/**
 * Implements exponential backoff retry logic
 * @param fn Function to retry
 * @param retries Number of retries
 * @param delay Initial delay in ms
 */
const withRetry = async <T>(
  fn: () => Promise<T>,
  retries = RETRY_COUNT,
  delay = INITIAL_DELAY
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0 || !isNetworkError(error)) {
      throw error;
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
};

/**
 * Validates the provided authentication code against the database
 * @param code The therapist access code to validate
 * @returns The therapist object if the code is valid, null otherwise
 */
export const checkAuthCode = async (code: string): Promise<Therapist | null> => {
  try {
    // Wrap the database query in retry logic
    const { data, error } = await withRetry(async () => {
      return await supabase
        .from('therapists')
        .select('*')
        .eq('code', code)
        .eq('active', true)
        .maybeSingle();
    });

    if (error) {
      console.error('Auth check error:', error);
      throw error;
    }

    if (data) {
      // Add is_admin flag based on code
      const isAdmin = code === 'admin123';
      const therapist = {
        ...data,
        is_admin: isAdmin
      };
    
      // Update last login timestamp silently
      try {
        await supabase
          .from('therapists')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.id);
      } catch (updateError) {
        // Don't fail login if update fails
        console.warn('Failed to update last login:', updateError);
      }
    
      // Store therapist data in localStorage
      try {
        localStorage.setItem('therapist', JSON.stringify(therapist));
      } catch (storageError) {
        console.warn('Failed to store therapist data:', storageError);
      }
      
      return therapist;
    }

    return null;
  } catch (error: any) {
    console.error('Error during authentication:', error);
    
    // Handle network errors with a user-friendly message
    if (isNetworkError(error)) {
      throw new Error('בעיית תקשורת. בודק חיבור לאינטרנט ומנסה שוב...');
    }
    
    throw error;
  }
};

/**
 * Gets the currently logged-in therapist from local storage
 * @returns The current therapist object or null if not logged in
 */
export const getCurrentTherapist = (): Therapist | null => {
  const storedTherapist = localStorage.getItem('therapist');
  if (storedTherapist) {
    try {
      return JSON.parse(storedTherapist);
    } catch (e) {
      console.error('Error parsing stored therapist data:', e);
      return null;
    }
  }
  return null;
};

/**
 * Logs the current user out
 */
export const logout = () => {
  // Remove therapist data from localStorage
  localStorage.removeItem('therapist');
  
  // Redirect to login page without confirmation dialog
  window.location.href = '/login';
};

/**
 * Check if the current user is an admin
 * @returns True if the current user is an admin, false otherwise
 */
export const isAdmin = (): boolean => {
  const therapist = getCurrentTherapist();
  return therapist?.is_admin || therapist?.code === 'admin123' || false;
};