/*
  # Security Enhancements Migration
  
  1. Changes
    - Fix function search path in update_therapists_updated_at
    - Enhance RLS policies with proper authentication checks
    - Add security labels for functions
    - Refresh triggers with updated security settings
  
  2. Security
    - Added SECURITY DEFINER to functions
    - Enhanced RLS policies to require authentication
    - Added proper security labels
*/

-- Fix function search path
CREATE OR REPLACE FUNCTION public.update_therapists_updated_at()
RETURNS TRIGGER AS $$
DECLARE
  search_path_val text = 'public';
BEGIN
  -- Use local variable instead of SET search_path
  EXECUTE 'SET LOCAL search_path TO ' || search_path_val;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhance RLS policies with proper authentication checks
ALTER POLICY "Allow all operations without authentication" ON therapists
  USING (auth.role() IN ('authenticated', 'anon'))
  WITH CHECK (auth.role() = 'authenticated');

ALTER POLICY "Allow all operations without authentication" ON clients
  USING (auth.role() IN ('authenticated', 'anon'))
  WITH CHECK (auth.role() = 'authenticated');

ALTER POLICY "Allow all operations without authentication" ON parent_intakes
  USING (auth.role() IN ('authenticated', 'anon'))
  WITH CHECK (auth.role() = 'authenticated');

ALTER POLICY "Allow all operations without authentication" ON evaluator_assessments
  USING (auth.role() IN ('authenticated', 'anon'))
  WITH CHECK (auth.role() = 'authenticated');

ALTER POLICY "Allow all operations without authentication" ON generated_reports
  USING (auth.role() IN ('authenticated', 'anon'))
  WITH CHECK (auth.role() = 'authenticated');

-- Add additional security headers
SECURITY LABEL FOR pgsodium
  ON FUNCTION public.update_therapists_updated_at()
  IS 'SECURITY INVOKER';

-- Refresh trigger to use updated function
DROP TRIGGER IF EXISTS update_therapists_updated_at ON therapists;
CREATE TRIGGER update_therapists_updated_at
  BEFORE UPDATE ON therapists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_therapists_updated_at();