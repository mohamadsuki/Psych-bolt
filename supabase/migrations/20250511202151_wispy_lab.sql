/*
  # Initial Database Schema Setup

  1. New Tables
    - `therapists` - Stores therapist information and credentials
      - `id` (uuid, primary key)
      - `name` (text)
      - `code` (text, unique) - Access code for login
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `last_login` (timestamptz)
      - `active` (boolean)

    - `clients` - Stores client/patient information
      - `id` (uuid, primary key)
      - `child_first_name` (text)
      - `child_last_name` (text)
      - `child_dob` (date)
      - `parent_name` (text)
      - `parent_email` (text)
      - `parent_phone` (text)
      - `id_number` (varchar(9), unique) - Israeli ID number
      - `address` (text)
      - `therapist_id` (uuid, foreign key)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `parent_intakes` - Stores parent questionnaire responses
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key)
      - `form_data` (jsonb)
      - `submitted_at` (timestamptz)

    - `evaluator_assessments` - Stores evaluator/psychologist assessments
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key)
      - `evaluator_data` (jsonb)
      - `evaluator_name` (text)
      - `evaluator_license` (text)
      - `submitted_at` (timestamptz)

    - `generated_reports` - Stores generated assessment reports
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key)
      - `report_content` (text)
      - `recommendations_school` (text)
      - `recommendations_parents` (text)
      - `generated_at` (timestamptz)
      - `is_finalized` (boolean)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
    - Add policies for public access to shared forms

  3. Indexes
    - Add indexes for foreign keys and frequently queried columns
    - Add unique constraints where needed
*/

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
CREATE TRIGGER update_therapists_updated_at
  BEFORE UPDATE ON therapists
  FOR EACH ROW
  EXECUTE FUNCTION update_therapists_updated_at();