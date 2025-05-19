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
const MAX_DELAY = 5000; // 5 seconds
const CONNECTIVITY_TIMEOUT = 5000; // 5 seconds timeout for connectivity check

interface ConnectivityCheckResult {
  isConnected: boolean;
  error?: {
    type: 'offline' | 'timeout' | 'server' | 'unknown';
    message: string;
  };
}

// Enhanced network check that tests actual connectivity to Supabase
const checkConnectivity = async (): Promise<ConnectivityCheckResult> => {
  try {
    // First check browser online status
    if (!navigator.onLine) {
      return {
        isConnected: false,
        error: {
          type: 'offline',
          message: 'הדפדפן במצב לא מקוון. נא לבדוק את חיבור האינטרנט ולנסות שוב.'
        }
      };
    }

    // Try to make a lightweight request to Supabase health check endpoint with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(`${supabase.supabaseUrl}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'apikey': supabase.supabaseKey,
          'Content-Type': 'application/json',
          'X-Client-Info': `supabase-js/${process.env.npm_package_version || 'unknown'}`
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        return {
          isConnected: false,
          error: {
            type: 'server',
            message: 'השרת אינו זמין כרגע. נא לנסות שוב בעוד מספר דקות.'
          }
        };
      }
      
      return { isConnected: true };
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        return {
          isConnected: false,
          error: {
            type: 'timeout',
            message: 'זמן התגובה של השרת ארוך מדי. נא לבדוק את איכות החיבור ולנסות שוב.'
          }
        };
      }
      throw e;
    }
  } catch (e) {
    console.warn('Connectivity check failed:', e);
    return {
      isConnected: false,
      error: {
        type: 'unknown',
        message: 'אירעה שגיאה בבדיקת החיבור לשרת. נא לנסות שוב.'
      }
    };
  }
};

/**
 * Implements exponential backoff retry logic with jitter
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
    
    const jitter = Math.random() * 200;
    const nextDelay = Math.min(delay * 2 + jitter, MAX_DELAY);
    
    console.log(`Retrying operation. Attempts remaining: ${retries - 1}`);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, nextDelay);
  }
};

/**
 * Validates the provided authentication code against the database
 * @param code The therapist access code to validate
 * @returns The therapist object if the code is valid, null otherwise
 */
export const checkAuthCode = async (code: string): Promise<Therapist | null> => {
  try {
    // Enhanced connectivity check with specific error messages
    const connectivityCheck = await checkConnectivity();
    if (!connectivityCheck.isConnected) {
      throw new Error(connectivityCheck.error?.message || 'בעיית תקשורת לא ידועה');
    }

    // Wrap the database query in retry logic with enhanced error handling
    const { data, error } = await withRetry(async () => {
      const response = await supabase
        .from('therapists')
        .select('*')
        .eq('code', code)
        .eq('active', true)
        .maybeSingle();

      if (response.error) {
        console.error('Supabase query error:', response.error);
        throw response.error;
      }

      return response;
    });

    if (error) {
      console.error('Auth check error:', error);
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        throw new Error('בעיית תקשורת. בודק חיבור לאינטרנט ומנסה שוב...');
      }
      throw error;
    }

    if (data) {
      const isAdmin = code === 'admin123';
      const therapist = {
        ...data,
        is_admin: isAdmin
      };
    
      try {
        await supabase
          .from('therapists')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.id);
      } catch (updateError) {
        console.warn('Failed to update last login:', updateError);
      }
    
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
    
    if (isNetworkError(error)) {
      const troubleshootingSteps = [
        'בדיקת חיבור לאינטרנט',
        'בדיקת חומת אש או הגדרות VPN',
        'ניקוי מטמון הדפדפן',
        'רענון הדף'
      ].map((step, index) => `${index + 1}. ${step}`).join('\n');
      
      throw new Error(
        `שגיאת תקשורת\n\nצעדים מומלצים לפתרון:\n${troubleshootingSteps}\n\nהמערכת תנסה להתחבר שוב אוטומטית...`
      );
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
      localStorage.removeItem('therapist');
      return null;
    }
  }
  return null;
};

/**
 * Logs the current user out
 */
export const logout = () => {
  localStorage.removeItem('therapist');
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