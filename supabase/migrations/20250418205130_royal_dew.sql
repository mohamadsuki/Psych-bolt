/*
  # Fix RLS policies for clients table

  1. Changes
    - Updates the RLS policy for the clients table to ensure proper access
    - Fixes the insert policy to correctly allow authenticated and anonymous users to insert records
  
  2. Security
    - Ensures that the RLS policy is properly applied
    - Maintains existing security constraints while fixing the access issue
*/

-- First ensure the clients table has RLS enabled
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Drop the existing insert policy if it exists
DROP POLICY IF EXISTS "Allow inserts for all users" ON public.clients;

-- Create a new insert policy that properly allows inserts
CREATE POLICY "Allow inserts for all users" 
ON public.clients
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Ensure the other policies exist and are correct
DROP POLICY IF EXISTS "Allow select for authenticated users" ON public.clients;
CREATE POLICY "Allow select for authenticated users" 
ON public.clients
FOR SELECT 
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow update for authenticated users" ON public.clients;
CREATE POLICY "Allow update for authenticated users" 
ON public.clients
FOR UPDATE 
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow delete for authenticated users" ON public.clients;
CREATE POLICY "Allow delete for authenticated users" 
ON public.clients
FOR DELETE 
TO authenticated
USING (true);