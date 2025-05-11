import { createDbClient } from './db-config';
import { dbCache } from './db-cache';
import { withRetry, generateCacheKey, isNetworkError } from './db-utils';

class DbClient {
  private static instance: DbClient;
  private supabase;
  
  private constructor() {
    this.supabase = createDbClient();
  }

  static getInstance(): DbClient {
    if (!DbClient.instance) {
      DbClient.instance = new DbClient();
    }
    return DbClient.instance;
  }

  private async executeQuery<T>(
    operation: () => Promise<{ data: T | null; error: any }>,
    cacheKey?: string
  ): Promise<T> {
    try {
      // Check cache first if cacheKey provided
      if (cacheKey) {
        const cached = dbCache.get(cacheKey);
        if (cached) return cached;
      }

      const result = await withRetry(async () => {
        const { data, error } = await operation();
        if (error) throw error;
        return data;
      });

      // Cache successful result if cacheKey provided
      if (cacheKey && result) {
        dbCache.set(cacheKey, result);
      }

      return result as T;
    } catch (error: any) {
      if (isNetworkError(error)) {
        throw new Error('Connection error. Please check your internet connection and try again.');
      }
      throw error;
    }
  }

  async getClients(filters: Record<string, any> = {}) {
    const cacheKey = generateCacheKey('clients', filters);
    return this.executeQuery(
      async () => this.supabase.from('clients').select('*').match(filters),
      cacheKey
    );
  }

  async getClientById(id: string) {
    const cacheKey = generateCacheKey('client', { id });
    return this.executeQuery(
      async () => this.supabase.from('clients').select('*').eq('id', id).single(),
      cacheKey
    );
  }

  async createClient(data: any) {
    return this.executeQuery(async () => {
      const result = await this.supabase.from('clients').insert(data).select();
      dbCache.clear(); // Invalidate all cache on write
      return result;
    });
  }

  async updateClient(id: string, data: any) {
    return this.executeQuery(async () => {
      const result = await this.supabase.from('clients').update(data).eq('id', id).select();
      dbCache.clear(); // Invalidate all cache on write
      return result;
    });
  }

  // Add similar methods for other tables...
}

export const dbClient = DbClient.getInstance();