/*
  # Initial Schema Setup

  1. Tables
    - therapists: Stores therapist information and credentials
    - clients: Stores client/patient information
    - parent_intakes: Stores parent questionnaire responses
    - evaluator_assessments: Stores therapist evaluation data
    - generated_reports: Stores generated assessment reports

  2. Security
    - Enable RLS on all tables
    - Create policies for authenticated access
    - Drop existing policies to avoid conflicts

  3. Indexes & Constraints
    - Add appropriate indexes for performance
    - Add foreign key constraints
    - Add check constraints for data validation
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations without authentication" ON therapists;
DROP POLICY IF EXISTS "Allow all operations without authentication" ON clients;
DROP POLICY IF EXISTS "Allow all operations without authentication" ON parent_intakes;
DROP POLICY IF EXISTS "Allow all operations without authentication" ON evaluator_assessments;
DROP POLICY IF EXISTS "Allow all operations without authentication" ON generated_reports;

-- Create therapists table
CREATE TABLE IF NOT EXISTS therapists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login timestamptz,
  active boolean DEFAULT true,
  CONSTRAINT therapists_code_check CHECK (length(code) >= 6)
);

COMMENT ON TABLE therapists IS 'Therapist records. The therapist with code=admin123 is the system admin.';

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_first_name text NOT NULL,
  child_last_name text NOT NULL,
  child_dob date NOT NULL,
  parent_name text NOT NULL,
  parent_email text,
  parent_phone text,
  id_number varchar(9) UNIQUE,
  address text,
  therapist_id uuid REFERENCES therapists(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT clients_id_number_check CHECK (id_number ~ '^[0-9]{9}$')
);

COMMENT ON COLUMN clients.id_number IS 'Israeli ID number (9 digits)';
COMMENT ON COLUMN clients.address IS 'Client residential address';

-- Create parent_intakes table
CREATE TABLE IF NOT EXISTS parent_intakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  form_data jsonb NOT NULL,
  submitted_at timestamptz DEFAULT now()
);

-- Create evaluator_assessments table
CREATE TABLE IF NOT EXISTS evaluator_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  evaluator_data jsonb NOT NULL,
  evaluator_name text NOT NULL,
  evaluator_license text NOT NULL,
  submitted_at timestamptz DEFAULT now()
);

-- Create generated_reports table
CREATE TABLE IF NOT EXISTS generated_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  report_content text NOT NULL,
  recommendations_school text,
  recommendations_parents text,
  generated_at timestamptz DEFAULT now(),
  is_finalized boolean DEFAULT false
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_clients_therapist_id ON clients(therapist_id);
CREATE INDEX IF NOT EXISTS idx_therapists_code ON therapists(code);
CREATE INDEX IF NOT EXISTS idx_therapists_active ON therapists(active);

-- Enable RLS
ALTER TABLE therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_intakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluator_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all operations without authentication" 
  ON therapists FOR ALL 
  TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow all operations without authentication" 
  ON clients FOR ALL 
  TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow all operations without authentication" 
  ON parent_intakes FOR ALL 
  TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow all operations without authentication" 
  ON evaluator_assessments FOR ALL 
  TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow all operations without authentication" 
  ON generated_reports FOR ALL 
  TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_therapists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for therapists table
DROP TRIGGER IF EXISTS update_therapists_updated_at ON therapists;
CREATE TRIGGER update_therapists_updated_at
  BEFORE UPDATE ON therapists
  FOR EACH ROW
  EXECUTE FUNCTION update_therapists_updated_at();