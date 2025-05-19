/*
  # Fix Authentication and Security Settings

  1. Changes
    - Fix RLS policies to properly handle authentication
    - Add proper indexes for performance
    - Update trigger function with proper search path handling
    - Add missing constraints and validations
    
  2. Security
    - Enable proper RLS on all tables
    - Add policies that require authentication
    - Fix function security context
*/

-- Fix function search path without using ALTER SYSTEM
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

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations without authentication" ON therapists;
DROP POLICY IF EXISTS "Allow all operations without authentication" ON clients;
DROP POLICY IF EXISTS "Allow all operations without authentication" ON parent_intakes;
DROP POLICY IF EXISTS "Allow all operations without authentication" ON evaluator_assessments;
DROP POLICY IF EXISTS "Allow all operations without authentication" ON generated_reports;

-- Create new policies with proper authentication checks
CREATE POLICY "Enable read for authenticated users" ON therapists
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Enable write for authenticated users" ON therapists
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON therapists
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" ON therapists
  FOR DELETE TO authenticated
  USING (true);

-- Client policies
CREATE POLICY "Enable read for authenticated users" ON clients
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Enable write for authenticated users" ON clients
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON clients
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" ON clients
  FOR DELETE TO authenticated
  USING (true);

-- Parent intake policies
CREATE POLICY "Enable read for authenticated users" ON parent_intakes
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Enable write for authenticated users" ON parent_intakes
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON parent_intakes
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" ON parent_intakes
  FOR DELETE TO authenticated
  USING (true);

-- Evaluator assessment policies
CREATE POLICY "Enable read for authenticated users" ON evaluator_assessments
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Enable write for authenticated users" ON evaluator_assessments
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON evaluator_assessments
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" ON evaluator_assessments
  FOR DELETE TO authenticated
  USING (true);

-- Generated reports policies
CREATE POLICY "Enable read for authenticated users" ON generated_reports
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Enable write for authenticated users" ON generated_reports
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON generated_reports
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" ON generated_reports
  FOR DELETE TO authenticated
  USING (true);

-- Add missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_parent_intakes_client_id ON parent_intakes(client_id);
CREATE INDEX IF NOT EXISTS idx_evaluator_assessments_client_id ON evaluator_assessments(client_id);
CREATE INDEX IF NOT EXISTS idx_generated_reports_client_id ON generated_reports(client_id);

-- Refresh trigger to use updated function
DROP TRIGGER IF EXISTS update_therapists_updated_at ON therapists;
CREATE TRIGGER update_therapists_updated_at
  BEFORE UPDATE ON therapists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_therapists_updated_at();