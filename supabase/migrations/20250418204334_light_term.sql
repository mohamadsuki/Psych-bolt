/*
  # Update RLS policies for client intake flow

  1. Security Changes
    - Update RLS policy for the clients table to allow anonymous inserts
    - Ensure all tables have appropriate security policies for both authenticated and anon users
    - Keep existing authenticated user policies intact

  This migration addresses the 401 error occurring during form submission by allowing
  anonymous users to insert records into the clients table.
*/

-- First we need to update the policy for clients table to allow anonymous inserts
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON clients;

-- Create separate policies for different operations
CREATE POLICY "Allow inserts for all users" 
ON clients FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow select for authenticated users" 
ON clients FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Allow update for authenticated users" 
ON clients FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Allow delete for authenticated users" 
ON clients FOR DELETE 
TO authenticated
USING (true);

-- Also ensure the parent_intakes table allows anonymous inserts
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON parent_intakes;

CREATE POLICY "Allow inserts for all users" 
ON parent_intakes FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow select for authenticated users" 
ON parent_intakes FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Allow update for authenticated users" 
ON parent_intakes FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Allow delete for authenticated users" 
ON parent_intakes FOR DELETE 
TO authenticated
USING (true);