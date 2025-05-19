/*
  # Update Database Policies and Triggers

  1. Changes
    - Drop and recreate policies with unique names
    - Add anonymous access for shared forms
    - Improve error handling in triggers
    - Add performance indexes
    
  2. Security
    - Update RLS policies for better access control
    - Add auth error handling triggers
    - Improve function security
*/

-- Drop existing policies with unique names to avoid conflicts
DROP POLICY IF EXISTS "Enable read for authenticated users" ON therapists;
DROP POLICY IF EXISTS "Enable write for authenticated users" ON therapists;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON therapists;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON therapists;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON clients;
DROP POLICY IF EXISTS "Enable write for authenticated users" ON clients;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON clients;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON clients;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON parent_intakes;
DROP POLICY IF EXISTS "Enable write for authenticated users" ON parent_intakes;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON parent_intakes;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON parent_intakes;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON evaluator_assessments;
DROP POLICY IF EXISTS "Enable write for authenticated users" ON evaluator_assessments;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON evaluator_assessments;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON evaluator_assessments;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON generated_reports;
DROP POLICY IF EXISTS "Enable write for authenticated users" ON generated_reports;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON generated_reports;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON generated_reports;

-- Drop any existing unified policies to avoid conflicts
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON therapists;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON clients;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON parent_intakes;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON evaluator_assessments;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON generated_reports;

-- Create new unified policies with unique names
CREATE POLICY "Enable authenticated user operations on therapists" ON therapists
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable authenticated user operations on clients" ON clients
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable authenticated user operations on parent_intakes" ON parent_intakes
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable authenticated user operations on evaluator_assessments" ON evaluator_assessments
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable authenticated user operations on generated_reports" ON generated_reports
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add anonymous access for shared forms
DROP POLICY IF EXISTS "Enable read for shared forms" ON clients;
DROP POLICY IF EXISTS "Enable read/write for shared forms" ON parent_intakes;

CREATE POLICY "Enable anonymous read for shared forms" ON clients
  FOR SELECT TO anon
  USING (id_number IS NOT NULL);

CREATE POLICY "Enable anonymous operations for shared forms" ON parent_intakes
  FOR ALL TO anon
  USING (EXISTS (
    SELECT 1 FROM clients c
    WHERE c.id = client_id
    AND c.id_number IS NOT NULL
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM clients c
    WHERE c.id = client_id
    AND c.id_number IS NOT NULL
  ));

-- Update function with better error handling
CREATE OR REPLACE FUNCTION public.update_therapists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Add error handling
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error in update_therapists_updated_at: %', SQLERRM;
    RETURN NEW;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_parent_intakes_submitted_at ON parent_intakes(submitted_at);
CREATE INDEX IF NOT EXISTS idx_evaluator_assessments_submitted_at ON evaluator_assessments(submitted_at);
CREATE INDEX IF NOT EXISTS idx_generated_reports_generated_at ON generated_reports(generated_at);
CREATE INDEX IF NOT EXISTS idx_therapists_last_login ON therapists(last_login);

-- Add better error handling for auth failures
CREATE OR REPLACE FUNCTION handle_auth_error() 
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    IF NOT (SELECT rolcanlogin FROM pg_roles WHERE rolname = current_user) THEN
      RAISE EXCEPTION 'Authentication required'
        USING HINT = 'Please sign in to perform this operation';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing auth error handling triggers to avoid conflicts
DROP TRIGGER IF EXISTS handle_auth_error_therapists ON therapists;
DROP TRIGGER IF EXISTS handle_auth_error_clients ON clients;
DROP TRIGGER IF EXISTS handle_auth_error_parent_intakes ON parent_intakes;
DROP TRIGGER IF EXISTS handle_auth_error_evaluator_assessments ON evaluator_assessments;
DROP TRIGGER IF EXISTS handle_auth_error_generated_reports ON generated_reports;

-- Add auth error handling triggers with unique names
CREATE TRIGGER handle_auth_error_therapists_trigger
  BEFORE INSERT OR UPDATE OR DELETE ON therapists
  FOR EACH ROW EXECUTE FUNCTION handle_auth_error();

CREATE TRIGGER handle_auth_error_clients_trigger
  BEFORE INSERT OR UPDATE OR DELETE ON clients
  FOR EACH ROW EXECUTE FUNCTION handle_auth_error();

CREATE TRIGGER handle_auth_error_parent_intakes_trigger
  BEFORE INSERT OR UPDATE OR DELETE ON parent_intakes
  FOR EACH ROW EXECUTE FUNCTION handle_auth_error();

CREATE TRIGGER handle_auth_error_evaluator_assessments_trigger
  BEFORE INSERT OR UPDATE OR DELETE ON evaluator_assessments
  FOR EACH ROW EXECUTE FUNCTION handle_auth_error();

CREATE TRIGGER handle_auth_error_generated_reports_trigger
  BEFORE INSERT OR UPDATE OR DELETE ON generated_reports
  FOR EACH ROW EXECUTE FUNCTION handle_auth_error();

-- Refresh updated_at trigger
DROP TRIGGER IF EXISTS update_therapists_updated_at ON therapists;
CREATE TRIGGER update_therapists_updated_at
  BEFORE UPDATE ON therapists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_therapists_updated_at();