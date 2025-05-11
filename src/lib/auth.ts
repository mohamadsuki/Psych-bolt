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
    // Check if we already have a session in localStorage
    if (localStorage.getItem('supabase.auth.token')) {
      return { isAuthenticated: true, success: true, error: null };
    }

    // Get the current session
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // If we have a session, user is authenticated
      if (session) {
        return { isAuthenticated: true, success: true, error: null };
      }
    } catch (sessionError) {
      console.error("Error getting auth session:", sessionError);
      
      if (isNetworkError(sessionError)) {
        return { 
          isAuthenticated: false, 
          success: false, 
          error: 'שגיאת תקשורת. נסה שוב מאוחר יותר.'
        };
      }
      
      // For other errors, continue with sign-in attempt
    }
    
    // Look up the therapist by code - Direct approach without connectivity checks
    const { data, error } = await supabase
      .from('therapists')
      .select('*')
      .eq('code', code)
      .maybeSingle();

    if (error) {
      console.error('Auth check error:', error);
      throw error;
    }

    if (data) {
      // Add is_admin flag based on code
      const isAdmin = code === 'admin123';
      return {
        ...data,
        is_admin: isAdmin
      };
    }

    return null;
  } catch (error: any) {
    console.error('Error during authentication:', error);
    
    // Handle network errors with a user-friendly message
    if (error.message?.includes('Failed to fetch') ||
        error.message?.includes('NetworkError') ||
        error.message?.includes('Network Error')) {
      throw new Error('שגיאת תקשורת. נסה שוב מאוחר יותר.');
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

// Get Supabase URL and key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;