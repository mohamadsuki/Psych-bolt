import { supabase } from './supabase';

// Type definition for Therapist
export interface Therapist {
  id: string;
  name: string;
  code: string;
  is_admin?: boolean;
}

/**
 * Validates the provided authentication code against the database
 * @param code The therapist access code to validate
 * @returns The therapist object if the code is valid, null otherwise
 */
export const checkAuthCode = async (code: string): Promise<Therapist | null> => {
  try {
    // Handle admin code as a special case
    if (code === 'admin123') {
      return {
        id: 'admin',
        name: 'מנהל מערכת',
        code: 'admin123',
        is_admin: true
      };
    }
    
    // Look up the therapist by code
    const { data, error } = await supabase
      .from('therapists')
      .select('*')
      .eq('code', code)
      .maybeSingle();

    if (error) {
      console.error('Auth check error:', error);
      
      if (isNetworkError(error)) {
        throw new Error('שגיאת תקשורת. נסה שוב מאוחר יותר.');
      }
      
      // For other database errors, return null (invalid code)
      return null;
    }

    if (data) {
      return {
        ...data,
        is_admin: false // Regular therapists are not admins
      };
    }

    return null;
  } catch (error: any) {
    console.error('Error during authentication:', error);
    
    // Handle network errors with a user-friendly message
    if (isNetworkError(error)) {
      throw new Error('שגיאת תקשורת. נסה שוב מאוחר יותר.');
    }
    
    // For other errors, return null (invalid code)
    return null;
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

// Get Supabase URL and key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Helper function to check network errors
const isNetworkError = (error: any): boolean => {
  if (!error) return false;
  
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return true;
  }
  
  const errorMsg = error.message || error.toString();
  return !!(
    errorMsg.includes('Failed to fetch') ||
    errorMsg.includes('NetworkError') ||
    errorMsg.includes('Network Error') ||
    errorMsg.includes('network') ||
    errorMsg.includes('timeout') ||
    errorMsg.includes('abort') ||
    errorMsg.includes('ECONNREFUSED') ||
    errorMsg.includes('ETIMEDOUT') ||
    error.name === 'AbortError' ||
    error.name === 'TimeoutError'
  );
};