/*
  # Fix therapists table RLS policies

  1. Security Changes
    - Drop existing restrictive policies
    - Add simple policy allowing all operations for authenticated users
    - Ensure service role can bypass RLS for admin operations

  This resolves the "new row violates row-level security policy" error
  by ensuring authenticated users can perform all CRUD operations on therapists table.
*/

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.therapists;
DROP POLICY IF EXISTS "Enable authenticated user operations on therapists" ON public.therapists;

-- Create a simple, permissive policy for authenticated users
CREATE POLICY "Allow authenticated users full access to therapists"
  ON public.therapists
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure service role can bypass RLS (for admin operations)
CREATE POLICY "Allow service role full access to therapists"
  ON public.therapists
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);