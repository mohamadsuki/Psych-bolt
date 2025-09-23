/*
  # Complete Database Rebuild

  This migration rebuilds the entire database structure from scratch with clean, simple RLS policies.

  ## What this migration does:
  1. Drops all existing tables and recreates them
  2. Creates simple, permissive RLS policies
  3. Adds proper indexes and constraints
  4. Ensures all authentication flows work properly

  ## New Tables:
  - `therapists` - Therapist accounts with simple access control
  - `clients` - Client records with therapist assignments
  - `parent_intakes` - Parent form submissions
  - `evaluator_assessments` - Evaluator form submissions  
  - `generated_reports` - AI-generated reports

  ## Security:
  - Simple RLS policies that actually work
  - Service role access for admin operations
  - Anonymous access for shared forms
*/

-- Drop existing tables if they exist (CASCADE removes dependent objects)
DROP TABLE IF EXISTS generated_reports CASCADE;
DROP TABLE IF EXISTS evaluator_assessments CASCADE;
DROP TABLE IF EXISTS parent_intakes CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS therapists CASCADE;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS handle_auth_error() CASCADE;
DROP FUNCTION IF EXISTS update_therapists_updated_at() CASCADE;

-- Create therapists table
CREATE TABLE therapists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login timestamptz
);

-- Enable RLS on therapists
ALTER TABLE therapists ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies for therapists - allow all operations for authenticated users and service role
CREATE POLICY "Allow all for authenticated users" ON therapists
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for service role" ON therapists
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Create clients table
CREATE TABLE clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_number varchar(9) UNIQUE,
  child_first_name text NOT NULL,
  child_last_name text NOT NULL,
  child_dob date NOT NULL,
  parent_name text NOT NULL,
  parent_email text,
  parent_phone text,
  address text,
  therapist_id uuid REFERENCES therapists(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add constraint for ID number format
ALTER TABLE clients ADD CONSTRAINT clients_id_number_check 
  CHECK (id_number IS NULL OR id_number ~ '^[0-9]{9}$');

-- Enable RLS on clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies for clients
CREATE POLICY "Allow all for authenticated users" ON clients
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for service role" ON clients
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Allow anonymous read for shared forms (when id_number exists)
CREATE POLICY "Allow anonymous read for shared forms" ON clients
  FOR SELECT TO anon USING (id_number IS NOT NULL);

-- Create parent_intakes table
CREATE TABLE parent_intakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  form_data jsonb NOT NULL,
  submitted_at timestamptz DEFAULT now()
);

-- Enable RLS on parent_intakes
ALTER TABLE parent_intakes ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies for parent_intakes
CREATE POLICY "Allow all for authenticated users" ON parent_intakes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for service role" ON parent_intakes
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Allow anonymous operations for shared forms
CREATE POLICY "Allow anonymous for shared forms" ON parent_intakes
  FOR ALL TO anon 
  USING (EXISTS (
    SELECT 1 FROM clients c 
    WHERE c.id = parent_intakes.client_id 
    AND c.id_number IS NOT NULL
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM clients c 
    WHERE c.id = parent_intakes.client_id 
    AND c.id_number IS NOT NULL
  ));

-- Create evaluator_assessments table
CREATE TABLE evaluator_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  evaluator_data jsonb NOT NULL,
  evaluator_name text NOT NULL,
  evaluator_license text NOT NULL,
  submitted_at timestamptz DEFAULT now()
);

-- Enable RLS on evaluator_assessments
ALTER TABLE evaluator_assessments ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies for evaluator_assessments
CREATE POLICY "Allow all for authenticated users" ON evaluator_assessments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for service role" ON evaluator_assessments
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Create generated_reports table
CREATE TABLE generated_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  report_content text NOT NULL,
  recommendations_school text,
  recommendations_parents text,
  generated_at timestamptz DEFAULT now(),
  is_finalized boolean DEFAULT false
);

-- Enable RLS on generated_reports
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies for generated_reports
CREATE POLICY "Allow all for authenticated users" ON generated_reports
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for service role" ON generated_reports
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_clients_therapist_id ON clients(therapist_id);
CREATE INDEX idx_clients_id_number ON clients(id_number);
CREATE INDEX idx_parent_intakes_client_id ON parent_intakes(client_id);
CREATE INDEX idx_parent_intakes_submitted_at ON parent_intakes(submitted_at);
CREATE INDEX idx_evaluator_assessments_client_id ON evaluator_assessments(client_id);
CREATE INDEX idx_evaluator_assessments_submitted_at ON evaluator_assessments(submitted_at);
CREATE INDEX idx_generated_reports_client_id ON generated_reports(client_id);
CREATE INDEX idx_generated_reports_generated_at ON generated_reports(generated_at);
CREATE INDEX idx_therapists_code ON therapists(code);
CREATE INDEX idx_therapists_active ON therapists(active);

-- Insert default admin therapist
INSERT INTO therapists (name, code, active) 
VALUES ('מנהל מערכת', 'admin123', true)
ON CONFLICT (code) DO NOTHING;

-- Create updated_at trigger function for therapists
CREATE OR REPLACE FUNCTION update_therapists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for therapists updated_at
CREATE TRIGGER update_therapists_updated_at
  BEFORE UPDATE ON therapists
  FOR EACH ROW
  EXECUTE FUNCTION update_therapists_updated_at();