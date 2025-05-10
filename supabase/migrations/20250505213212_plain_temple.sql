/*
  # Add therapist authentication system

  1. New Tables
    - `therapists` - Store therapist information and access codes
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `code` (text, unique, required) - Authentication code
      - `is_admin` (boolean) - Admin flag for full access
      - `created_at` (timestamp)
  
  2. Changes
    - Add `therapist_id` column to `clients` table to establish relationship
    - Add foreign key constraint to maintain referential integrity
  
  3. Security
    - Enable RLS on the therapists table
    - Add security policies for access control
*/

-- Create therapists table
CREATE TABLE IF NOT EXISTS therapists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add therapist_id to clients table
ALTER TABLE clients
ADD COLUMN therapist_id uuid REFERENCES therapists(id) ON DELETE SET NULL;

-- Create index for faster lookup
CREATE INDEX idx_clients_therapist_id ON clients(therapist_id);

-- Enable Row Level Security
ALTER TABLE therapists ENABLE ROW LEVEL SECURITY;

-- Create policies for the therapists table
CREATE POLICY "Allow all operations without authentication" ON therapists
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default admin user
INSERT INTO therapists (name, code, is_admin)
VALUES ('מנהל המערכת', 'admin123', true);

-- Assign all existing clients to the default admin
UPDATE clients
SET therapist_id = (SELECT id FROM therapists WHERE is_admin = true)
WHERE therapist_id IS NULL;