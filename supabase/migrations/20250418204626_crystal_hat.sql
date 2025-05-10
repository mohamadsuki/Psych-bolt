/*
  # Fix clients table RLS policies

  1. Changes
    - Update INSERT policy for clients table to properly allow anonymous inserts
    - Ensure RLS is enabled on clients table

  This migration fixes the "new row violates row-level security policy for table clients" 
  error by properly configuring row level security policies.
*/

-- First verify RLS is enabled on the clients table
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Drop the existing insert policy if it exists (to avoid conflicts)
DROP POLICY IF EXISTS "Allow inserts for all users" ON clients;

-- Create a new permissive insert policy for both anonymous and authenticated users
CREATE POLICY "Allow inserts for all users"
ON clients
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Ensure other policies are set correctly
DROP POLICY IF EXISTS "Allow select for authenticated users" ON clients;
CREATE POLICY "Allow select for authenticated users"
ON clients
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow update for authenticated users" ON clients;
CREATE POLICY "Allow update for authenticated users"
ON clients
FOR UPDATE
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow delete for authenticated users" ON clients;
CREATE POLICY "Allow delete for authenticated users"
ON clients
FOR DELETE
TO authenticated
USING (true);