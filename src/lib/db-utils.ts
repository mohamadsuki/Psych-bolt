import { DB_CONFIG } from './db-config';
import { dbCache } from './db-cache';

export const isNetworkError = (error: any): boolean => {
  if (!error) return false;
  if (!navigator.onLine) return true;

  const errorMsg = error.message?.toLowerCase() || '';
  return !!(
    errorMsg.includes('failed to fetch') ||
    errorMsg.includes('network') ||
    errorMsg.includes('timeout') ||
    errorMsg.includes('abort') ||
    error.name === 'AbortError' ||
    error.name === 'TimeoutError' ||
    error.code === 'ECONNREFUSED' ||
    error.code === 'ETIMEDOUT'
  );
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  retries = DB_CONFIG.MAX_RETRIES
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await operation();
      return result;
    } catch (error: any) {
      lastError = error;
      
      if (attempt < retries && isNetworkError(error)) {
        const delay = DB_CONFIG.RETRY_DELAYS[attempt] || DB_CONFIG.RETRY_DELAYS[DB_CONFIG.RETRY_DELAYS.length - 1];
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}

export const generateCacheKey = (base: string, params: Record<string, any> = {}): string => {
  const sortedParams = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`)
    .join('|');
  return `${base}${sortedParams ? `|${sortedParams}` : ''}`;
};