import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// In-memory cache for faster retrieval
const cache = {
  clients: new Map(),
  parentIntakes: new Map(),
  evaluatorAssessments: new Map(),
  reports: new Map(),
  therapists: new Map(),
  // Cache expiration timestamps
  expiry: new Map(),
  // Cache response for 5 minutes by default
  ttl: 5 * 60 * 1000
};

// Cache management functions
const addToCache = (key: string, id: string, data: any) => {
  const cacheKey = `${key}:${id}`;
  if (!data) return;
  
  cache[key].set(id, data);
  cache.expiry.set(cacheKey, Date.now() + cache.ttl);
};

const getFromCache = (key: string, id: string) => {
  const cacheKey = `${key}:${id}`;
  const expiry = cache.expiry.get(cacheKey);
  
  if (!expiry || Date.now() > expiry) {
    // Cache expired or doesn't exist
    cache[key].delete(id);
    cache.expiry.delete(cacheKey);
    return null;
  }
  
  return cache[key].get(id);
};

const invalidateCache = (key?: string, id?: string) => {
  if (key && id) {
    // Invalidate specific item
    const cacheKey = `${key}:${id}`;
    cache[key].delete(id);
    cache.expiry.delete(cacheKey);
  } else if (key) {
    // Invalidate entire collection
    cache[key].clear();
    // Clear related expiry entries
    for (const cacheKey of cache.expiry.keys()) {
      if (cacheKey.startsWith(`${key}:`)) {
        cache.expiry.delete(cacheKey);
      }
    }
  } else {
    // Invalidate all cache
    for (const key of Object.keys(cache)) {
      if (key !== 'expiry' && key !== 'ttl') {
        cache[key].clear();
      }
    }
    cache.expiry.clear();
  }
};

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file');
}

// Configure Supabase client with improved options for production environments
export const supabase = createClient(supabaseUrl as string, supabaseAnonKey as string, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
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
          console.warn('Failed to save auth state to localStorage');
        }
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key);
        } catch {
          console.warn('Failed to remove auth state from localStorage');
        }
      }
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js'
    },
    fetch: (url, options) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      return fetch(url, {
        ...options,
        signal: controller.signal,
        keepalive: true,
        cache: 'default'
      }).finally(() => clearTimeout(timeoutId));
    }
  },
  db: {
    schema: 'public',
    poolConfig: {
      maxConnections: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    }
  }
});

// Configure better timeout for fetch operations
const FETCH_TIMEOUT = 10000;
const RETRY_DELAYS = [1000, 3000, 5000];
const MAX_RETRIES = 3;
const CACHE_TTL = 5 * 60 * 1000;

cache.ttl = CACHE_TTL;

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

async function withRetry<T>(fn: () => Promise<T>, maxRetries = MAX_RETRIES): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const controller = new AbortController();
      const signal = controller.signal;
      
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, FETCH_TIMEOUT);
      
      try {
        (window as any).__currentFetchController = controller;
        
        const result = await fn();
        
        clearTimeout(timeoutId);
        
        delete (window as any).__currentFetchController;
        
        return result;
      } catch (error) {
        clearTimeout(timeoutId);
        
        delete (window as any).__currentFetchController;
        
        throw error;
      }
    } catch (error: any) {
      console.warn(`Attempt ${i + 1}/${maxRetries + 1} failed:`, error?.message || error);
      lastError = error;
      
      if (i < maxRetries && isNetworkError(error)) {
        const delay = RETRY_DELAYS[i] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
        console.log(`Network error detected, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
}

// Therapist management functions
export const getTherapists = async () => {
  try {
    // Check cache first
    const cachedTherapists = getFromCache('therapists', 'all');
    if (cachedTherapists) {
      return cachedTherapists;
    }

    const { data, error } = await withRetry(async () => {
      return await supabase
        .from('therapists')
        .select('*')
        .order('name');
    });

    if (error) throw error;

    // Cache the results
    addToCache('therapists', 'all', data);

    return data || [];
  } catch (error: any) {
    console.error('Error fetching therapists:', error);
    if (isNetworkError(error)) {
      throw new Error('שגיאת תקשורת. נסה שוב מאוחר יותר.');
    }
    throw error;
  }
};

export const createTherapist = async (therapistData: { id?: string, name: string, code: string }) => {
  try {
    let query;
    
    if (therapistData.id) {
      // Update existing therapist
      query = supabase
        .from('therapists')
        .update({
          name: therapistData.name,
          code: therapistData.code,
          updated_at: new Date().toISOString()
        })
        .eq('id', therapistData.id)
        .select();
    } else {
      // Create new therapist
      query = supabase
        .from('therapists')
        .insert({
          name: therapistData.name,
          code: therapistData.code,
          active: true
        })
        .select();
    }

    const { data, error } = await withRetry(async () => {
      return await query;
    });

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('קוד גישה זה כבר קיים במערכת');
      }
      throw error;
    }

    // Invalidate cache
    invalidateCache('therapists');

    return data[0];
  } catch (error: any) {
    console.error('Error creating/updating therapist:', error);
    if (isNetworkError(error)) {
      throw new Error('שגיאת תקשורת. נסה שוב מאוחר יותר.');
    }
    throw error;
  }
};

export const deleteTherapist = async (id: string) => {
  try {
    const { error } = await withRetry(async () => {
      return await supabase
        .from('therapists')
        .delete()
        .eq('id', id);
    });

    if (error) throw error;

    // Invalidate cache
    invalidateCache('therapists');

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting therapist:', error);
    if (isNetworkError(error)) {
      throw new Error('שגיאת תקשורת. נסה שוב מאוחר יותר.');
    }
    throw error;
  }
};

export const updateClientTherapist = async (clientId: string, therapistId: string) => {
  try {
    const { data, error } = await withRetry(async () => {
      return await supabase
        .from('clients')
        .update({ 
          therapist_id: therapistId || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId)
        .select();
    });

    if (error) throw error;

    // Invalidate relevant caches
    invalidateCache('clients', clientId);
    invalidateCache('therapists');

    return data[0];
  } catch (error: any) {
    console.error('Error updating client therapist:', error);
    if (isNetworkError(error)) {
      throw new Error('שגיאת תקשורת. נסה שוב מאוחר יותר.');
    }
    throw error;
  }
};

// Authentication check function
export const checkAuthStatus = async (triggerSignIn = false) => {
  try {
    if (localStorage.getItem('supabase.auth.token')) {
      return { isAuthenticated: true, success: true, error: null };
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
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
    }
    
    if (triggerSignIn) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'demo@example.com',
          password: 'demopassword123'
        });
        
        if (error) {
          console.error('Auth error:', error);
          if (error.message.includes('Invalid login credentials')) {
            try {
              const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: 'demo@example.com',
                password: 'demopassword123'
              });
              
              if (signUpError) {
                return { isAuthenticated: false, success: false, error: signUpError.message };
              }
              
              const { data: signInAfterSignUpData, error: signInAfterSignUpError } = 
                await supabase.auth.signInWithPassword({
                  email: 'demo@example.com',
                  password: 'demopassword123'
                });
                
              if (signInAfterSignUpError) {
                return { isAuthenticated: false, success: false, error: signInAfterSignUpError.message };
              }
              
              return { isAuthenticated: true, success: true, error: null };
            } catch (signUpCatchError) {
              if (isNetworkError(signUpCatchError)) {
                return { 
                  isAuthenticated: false, 
                  success: false, 
                  error: 'שגיאת תקשורת. נסה שוב מאוחר יותר.' 
                };
              }
              return { isAuthenticated: false, success: false, error: signUpCatchError.message };
            }
          }
          
          return { isAuthenticated: false, success: false, error: error.message };
        }
        
        return { isAuthenticated: !!data.session, success: true, error: null };
      } catch (signInError) {
        console.error("Sign in error:", signInError);
        
        if (isNetworkError(signInError)) {
          return { 
            isAuthenticated: false, 
            success: false, 
            error: 'שגיאת תקשורת. נסה שוב מאוחר יותר.' 
          };
        }
        
        return { isAuthenticated: false, success: false, error: signInError.message };
      }
    }
    
    return { isAuthenticated: false, success: false, error: null };
  } catch (error: any) {
    console.error('Error checking authentication status:', error);
    
    if (isNetworkError(error)) {
      return { 
        isAuthenticated: false, 
        success: false, 
        error: 'שגיאת תקשורת. נסה שוב מאוחר יותר.' 
      };
    }
    
    return { 
      isAuthenticated: false, 
      success: false, 
      error: `שגיאה: ${error.message}` 
    };
  }
};

// Client-related functions
export const getClients = async () => {
  try {    
    let therapistData = null;
    try {
      const therapist = localStorage.getItem('therapist');
      if (therapist) {
        therapistData = JSON.parse(therapist);
      }
    } catch (storageError) {
      console.warn('Error reading therapist from localStorage:', storageError);
    }
    
    const cacheKey = therapistData ? 
      (therapistData.is_admin ? 'admin' : therapistData.id) : 
      'all';
    
    const cachedClients = getFromCache('clients', cacheKey);
    if (cachedClients) {
      return cachedClients;
    }
    
    let query = supabase.from('clients').select('*').order('created_at', { ascending: false });
    
    if (therapistData && !therapistData.is_admin) {
      query = query.eq('therapist_id', therapistData.id);
    }
    
    const { data, error } = await withRetry(async () => {
      return await query;
    });
    
    if (error) throw error;
    
    addToCache('clients', cacheKey, data);
    
    return data || [];
  } catch (error: any) {
    console.error('Error fetching clients:', error);
    
    if (isNetworkError(error)) {
      throw new Error('שגיאת תקשורת. נסה שוב מאוחר יותר.');
    }
    
    throw error;
  }
};

export const updateClientRecord = async (clientId: string, childData: any) => {
  try {
    if (!childData.idNumber || !/^\d{9}$/.test(childData.idNumber)) {
      throw new Error('מספר תעודת זהות חייב להיות 9 ספרות');
    }
    
    try {
      const { data: existingClient, error: fetchError } = await supabase
        .from('clients')
        .select('id')
        .eq('id_number', childData.idNumber)
        .neq('id', clientId)
        .maybeSingle();
        
      if (fetchError) throw fetchError;
        
      if (existingClient) {
        throw new Error('מספר תעודת זהות כבר קיים במערכת עבור לקוח אחר.');
      }
    } catch (checkError) {
      if (isNetworkError(checkError)) {
        throw new Error('שגיאת תקשורת. נסה שוב מאוחר יותר.');
      }
      throw checkError;
    }
    
    try {
      const { data, error } = await supabase
        .from('clients')
        .update({
          id_number: childData.idNumber,
          child_first_name: childData.firstName,
          child_last_name: childData.lastName,
          child_dob: childData.dob,
          parent_name: childData.parentName,
          parent_email: childData.parentEmail || null,
          parent_phone: childData.parentPhone,
          address: childData.address
        })
        .eq('id', clientId)
        .select();
      
      if (error) {
        console.error('Update error details:', error);
        
        if (error.message?.includes('violates row-level security policy')) {
          throw new Error('Permission denied. Please ensure you are logged in to update client records.');
        }
        throw error;
      }
      
      invalidateCache('clients', clientId);
      
      return data[0];
    } catch (updateError) {
      if (isNetworkError(updateError)) {
        throw new Error('שגיאת תקשורת. נסה שוב מאוחר יותר.');
      }
      throw updateError;
    }
  } catch (error: any) {
    console.error('Error updating client:', error);
    
    if (isNetworkError(error)) {
      throw new Error('שגיאת תקשורת. נסה שוב מאוחר יותר.');
    }
    
    throw error;
  }
};

export const deleteClientRecord = async (clientId: string) => {
  try {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);
      
      if (error) {
        console.error('Delete error details:', error);
        
        if (error.message?.includes('violates row-level security policy')) {
          throw new Error('Permission denied. Please ensure you are logged in to delete client records.');
        }
        throw error;
      }
      
      invalidateCache('clients', clientId);
      invalidateCache('parentIntakes', clientId);
      invalidateCache('evaluatorAssessments', clientId);
      invalidateCache('reports', clientId);
      
      return { success: true };
    } catch (deleteError) {
      if (isNetworkError(deleteError)) {
        throw new Error('שגיאת תקשורת. נסה שוב מאוחר יותר.');
      }
      throw deleteError;
    }
  } catch (error: any) {
    console.error('Error deleting client:', error);
    
    if (isNetworkError(error)) {
      throw new Error('שגיאת תקשורת. נסה שוב מאוחר יותר.');
    }
    
    throw error;
  }
};

export const getClientById = async (id: string) => {
  try {
    const cachedClient = getFromCache('clients', id);
    if (cachedClient) {
      return cachedClient;
    }

    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      addToCache('clients', id, data);
      
      return data;
    } catch (queryError) {
      if (isNetworkError(queryError)) {
        throw new Error('שגיאת תקשורת. נסה שוב מאוחר יותר.');
      }
      throw queryError;
    }
  } catch (error: any) {
    console.error('Error fetching client:', error);
    
    if (isNetworkError(error)) {
      throw new Error('שגיאת תקשורת. נסה שוב מאוחר יותר.');
    }
    
    throw error;
  }
};

export const getClientByIdNumber = async (idNumber: string) => {
  try {
    const cachedClient = getFromCache('clients', `idnumber:${idNumber}`);
    if (cachedClient) {
      return cachedClient;
    }

    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id_number', idNumber)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        addToCache('clients', `idnumber:${idNumber}`, data);
        addToCache('clients', data.id, data);
      }
      
      return data;
    } catch (queryError) {
      if (isNetworkError(queryError)) {
        throw new Error('שגיאת תקשורת. נסה שוב מאוחר יותר.');
      }
      throw queryError;
    }
  } catch (error: any) {
    console.error('Error fetching client by ID number:', error);
    
    if (isNetworkError(error)) {
      throw new Error('שגיאת תקשורת. נסה שוב מאוחר יותר.');
    }
    
    throw error;
  }
};

// Parent intake functions
export const saveParentIntake = async (clientId: string, formData: any, isSubmitted: boolean = false) => {
  try {
    try {
      const { data: existingIntake, error: fetchError } = await supabase
        .from('parent_intakes')
        .select('id')
        .eq('client_id', clientId)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      const submittedAt = isSubmitted ? new Date().toISOString() : null;

      if (existingIntake) {
        const updateData: any = { form_data: formData };
        
        if (isSubmitted) {
          updateData.submitted_at = submittedAt;
        }
        
        const { data, error } = await supabase
          .from('parent_intakes')
          .update(updateData)
          .eq('id', existingIntake.id)
          .select();

        if (error) throw error;
        
        invalidateCache('parentIntakes', clientId);
        
        return data[0];
      } else {
        const { data, error } = await supabase
          .from('parent_intakes')
          .insert({
            client_id: clientId,
            form_data: formData,
            submitted_at: isSubmitted ? submittedAt : null
          })
          .select();
        
        if (error) throw error;
        
        invalidateCache('parentIntakes', clientId);
        
        return data[0];
      }
    } catch (queryError) {
      if (isNetworkError(queryError)) {
        throw new Error('שגיאת תקשורת. נסה שוב מאוחר יותר.');
      }
      throw queryError;
    }
  } catch (error: any) {
    console.error('Error saving parent intake:', error);
    
    if (isNetworkError(error)) {
      throw new Error('שגיאת תקשורת. נסה שוב מאוחר יותר.');
    }
    
    throw error;
  }
};

export const getParentIntake = async (clientId: string) => {
  try {
    const cachedIntake = getFromCache('parentIntakes', clientId);
    if (cachedIntake) {
      return cachedIntake;
    }

    try {
      const { data, error } = await supabase
        .from('parent_intakes')
        .select('*')
        .eq('client_id', clientId)
        .maybeSingle();
      
      if (error) throw error;
      
      addToCache('parentIntakes', clientId, data);
      
      return data;
    } catch (queryError) {
      if (isNetworkError(queryError)) {
        throw new Error('שגיאת תקשורת. נסה שוב מאוחר יותר.');
      }
      throw queryError;
    }
  } catch (error: any) {
    console.error('Error fetching parent intake:', error);
    
    if (isNetworkError(error)) {
      throw new Error('שגיאת תקשורת. נסה שוב מאוחר יותר.');
    }
    
    throw error;
  }
};

// Evaluator assessment functions
export const saveEvaluatorAssessment = async (clientId: string, evaluatorData: any, isSubmitted: boolean = false) => {
  try {
    const sanitizedData = { ...evaluatorData };
    
    if (!Array.isArray(sanitizedData.diagnosis)) {
      sanitizedData.diagnosis = [];
    }
    
    if (!Array.isArray(sanitizedData.validityFactors)) {
      sanitizedData.validityFactors = [];
    }
    
    if (!Array.isArray(sanitizedData.testsAdministered)) {
      sanitizedData.testsAdministered = [];
    }
    
    try {
      const { data: existingAssessment, error: fetchError } = await supabase
        .from('evaluator_assessments')
        .select('id')
        .eq('client_id', clientId)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      const submittedAt = isSubmitted ? new Date().toISOString() : null;

      if (existingAssessment) {
        const updateData: any = { 
          evaluator_data: sanitizedData,
          evaluator_name: sanitizedData.evaluator?.name || 'Unknown',
          evaluator_license: sanitizedData.evaluator?.licenseNo || 'Unknown'
        };
        
        if (isSubmitted) {
          updateData.submitted_at = submittedAt;
        }
        
        const { data, error } = await supabase
          .from('evaluator_assessments')
          .update(updateData)
          .eq('id', existingAssessment.id)
          .select();

        if (error) throw error;
        
        invalidateCache('evaluatorAssessments', clientId);
        
        return data[0];
      } else {
        const { data, error } = await supabase
          .from('evaluator_assessments')
          .insert({
            client_id: clientId,
            evaluator_data: sanitizedData,
            evaluator_name: sanitizedData.evaluator?.name || 'Unknown',
            evaluator_license: sanitizedData.evaluator?.licenseNo || 'Unknown',
            submitted_at: isSubmitted ? submittedAt : null
          })
          .select();
        
        if (error) throw error;
        
        invalidateCache('evaluatorAssessments', clientId);
        
        return data[0];
      }
    } catch (queryError) {
      if (isNetworkError(queryError)) {
        throw new Error('שגיאת תקשורת. נסה שוב מאוחר יותר.');
      }
      throw queryError;
    }
  } catch (error: any) {
    console.error('Error saving evaluator assessment:', error);
    
    if (isNetworkError(error)) {
      throw new Error('שגיאת תקשורת. נסה שוב מאוחר יותר.');
    }
    
    throw error;
  }
};

export const getEvaluatorAssessment = async (clientId: string) => {
  try {
    const cachedAssessment = getFromCache('evaluatorAssessments', clientId);
    if (cachedAssessment) {
      return cachedAssessment;
    }

    try {
      const { data, error } = await supabase
        .from('evaluator_assessments')
        .select('*')
        .eq('client_id', clientId)
        .maybeSingle();
      
      if (error) throw error;
      
      addToCache('evaluatorAssessments', clientId, data);
      
      return data;
    } catch (queryError) {
      if (isNetworkError(queryError)) {
        throw new Error('שגיאת תקשורת. נסה שוב מאוחר יותר.');
      }
      throw queryError;
    }
  } catch (error: any) {
    console.error('Error fetching evaluator assessment:', error);
    
    if (isNetworkError(error)) {
      throw new Error('שגיאת תקשורת. נסה שוב מאוחר יותר.');
    }
    
    throw error;
  }
};

// Report functions
export const saveGeneratedReport = async (clientId: string, reportContent: string, recommendations: { school: string, parents: string }) => {
  try {
    try {
      const { data: existingReport, error: fetchError } = await supabase
        .from('generated_reports')
        .select('id')
        .eq('client_id', clientId)
        .maybeSingle();
      
      if (fetchError) throw fetchError;
      
      if (existingReport) {
        const { data, error } = await supabase
          .from('generated_reports')
          .update({
            report_content: reportContent,
            recommendations_school: recommendations.school,
            recommendations_parents: recommendations.parents,
            generated_at: new Date().toISOString()
          })
          .eq('id', existingReport.id)
          .select();
        
        if (error) throw error;
        
        invalidateCache('reports', clientId);
        
        return data[0];
      } else {
        const { data, error } = await supabase
          .from('generated_reports')
          .insert({
            client_id: clientId,
            report_content: reportContent,
            recommendations_school: recommendations.school,
            recommendations_parents: recommendations.parents
          })
          .select();
        
        if (error) throw error;
        
        invalidateCache('reports', clientId);
        
        return data[0];
      }
    } catch (queryError) {
      if (isNetworkError(queryError)) {
        throw new Error('שגיאת תקשורת. נסה שוב מאוחר יותר.');
      }
      throw queryError;
    }
  } catch (error: any) {
    console.error('Error saving generated report:', error);
    
    if (isNetworkError(error)) {
      throw new Error('שגיאת תקשורת. נסה שוב מאוחר יותר.');
    }
    
    throw error;
  }
};

export const getGeneratedReport = async (clientId: string) => {
  try {
    const cachedReport = getFromCache('reports', clientId);
    if (cachedReport) {
      return cachedReport;
    }

    try {
      const { data, error } = await supabase
        .from('generated_reports')
        .select('*')
        .eq('client_id', clientId)
        .maybeSingle();
      
      if (error) throw error;
      
      addToCache('reports', clientId, data);
      
      return data;
    } catch (queryError) {
      if (isNetworkError(queryError)) {
        throw new Error('שגיאת תקשורת. נסה שוב מאוחר יותר.');
      }
      throw queryError;
    }
  } catch (error: any) {
    console.error('Error fetching generated report:', error);
    
    if (isNetworkError(error)) {
      throw new Error('שגיאת תקשורת. נסה שוב מאוחר יותר.');
    }
    
    throw error;
  }
};

export const finalizeReport = async (clientId: string) => {
  try {
    try {
      const { data, error } = await supabase
        .from('generated_reports')
        .update({ is_finalized: true })
        .eq('client_id', clientId)
        .select();
      
      if (error) throw error;
      
      invalidateCache('reports', clientId);
      
      return data[0];
    } catch (queryError) {
      if (isNetworkError(queryError)) {
        throw new Error('שגיאת תקשורת. נסה שוב מאוחר יותר.');
      }
      throw queryError;
    }
  } catch (error: any) {
    console.error('Error finalizing report:', error);
    
    if (isNetworkError(error)) {
      throw new Error('שגיאת תקשורת. נסה שוב מאוחר יותר.');
    }
    
    throw error;
  }
};