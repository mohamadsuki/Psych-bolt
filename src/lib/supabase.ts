import { dbClient } from './db-client';
import { createDbClient } from './db-config';

// Create a single Supabase instance for direct access when needed
export const supabase = createDbClient();

// Export all database operations through the client
export const getClients = () => dbClient.getClients();
export const getClientById = (id: string) => dbClient.getClientById(id);
export const createClientRecord = (data: any) => dbClient.createClient(data);
export const updateClientRecord = (id: string, data: any) => dbClient.updateClient(id, data);