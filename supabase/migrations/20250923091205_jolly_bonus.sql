/*
  # Fix therapists table RLS policies

  This migration fixes the RLS policies on the therapists table to allow proper
  INSERT, UPDATE, and DELETE operations for authenticated users.

  ## Changes
  1. Drop existing conflicting policies
  2. Create simple, permissive policies for authenticated users
  3. Ensure service role has full access
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users full access to therapists" ON therapists;
DROP POLICY IF EXISTS "Allow service role full access to therapists" ON therapists;

-- Create new permissive policies
CREATE POLICY "Enable all operations for authenticated users" ON therapists
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable all operations for service role" ON therapists
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE therapists ENABLE ROW LEVEL SECURITY;