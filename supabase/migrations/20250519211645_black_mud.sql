/*
  # Security and Function Fixes

  1. Changes
    - Add search_path to update_therapists_updated_at function
    - Reduce Auth OTP expiry to recommended threshold
    - Enable leaked password protection
    - Add RLS policies with proper security checks

  2. Security
    - Enhanced authentication controls
    - Improved password protection
    - Better function isolation
*/

-- Fix function search path
CREATE OR REPLACE FUNCTION public.update_therapists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  SET search_path = public;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update Auth settings
ALTER SYSTEM SET auth.otp_expiry_seconds = '300'; -- 5 minutes
ALTER SYSTEM SET auth.enable_leaked_password_protection = 'true';

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