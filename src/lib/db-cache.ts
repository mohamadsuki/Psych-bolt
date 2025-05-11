import { DB_CONFIG } from './db-config';

class DbCache {
  private static instance: DbCache;
  private cache: Map<string, any>;
  private expiry: Map<string, number>;

  private constructor() {
    this.cache = new Map();
    this.expiry = new Map();
  }

  static getInstance(): DbCache {
    if (!DbCache.instance) {
      DbCache.instance = new DbCache();
    }
    return DbCache.instance;
  }

  set(key: string, value: any): void {
    if (!value) return;
    this.cache.set(key, value);
    this.expiry.set(key, Date.now() + DB_CONFIG.CACHE_TTL);
  }

  get(key: string): any {
    const expiryTime = this.expiry.get(key);
    if (!expiryTime || Date.now() > expiryTime) {
      this.delete(key);
      return null;
    }
    return this.cache.get(key);
  }

  delete(key: string): void {
    this.cache.delete(key);
    this.expiry.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.expiry.clear();
  }
}

export const dbCache = DbCache.getInstance();