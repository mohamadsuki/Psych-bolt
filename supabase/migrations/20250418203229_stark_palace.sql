/*
  # Create schema for psychological assessment app

  1. New Tables
    - `clients` - Main client information table
    - `parent_intakes` - Parent intake form data
    - `evaluator_assessments` - Psychologist evaluation data
    - `generated_reports` - AI-generated reports and recommendations
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_first_name TEXT NOT NULL,
  child_last_name TEXT NOT NULL,
  child_dob DATE NOT NULL,
  parent_name TEXT NOT NULL,
  parent_email TEXT,
  parent_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create parent_intakes table
CREATE TABLE IF NOT EXISTS parent_intakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  form_data JSONB NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

-- Create evaluator_assessments table
CREATE TABLE IF NOT EXISTS evaluator_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  evaluator_data JSONB NOT NULL,
  evaluator_name TEXT NOT NULL,
  evaluator_license TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

-- Create generated_reports table
CREATE TABLE IF NOT EXISTS generated_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  report_content TEXT NOT NULL,
  recommendations_school TEXT,
  recommendations_parents TEXT,
  generated_at TIMESTAMPTZ DEFAULT now(),
  is_finalized BOOLEAN DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_intakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluator_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON clients
  FOR ALL TO authenticated
  USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON parent_intakes
  FOR ALL TO authenticated
  USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON evaluator_assessments
  FOR ALL TO authenticated
  USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON generated_reports
  FOR ALL TO authenticated
  USING (true);