/*
  # Improve therapist authentication system

  1. Changes
    - Add updated_at column to therapists table
    - Add last_login column to track successful logins
    - Add active column to enable/disable therapist accounts
    - Add indexes for faster lookups
    
  2. Security
    - Keep existing RLS policies
    - Add comments for better documentation
*/

-- Add new columns to therapists table
ALTER TABLE therapists
ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now(),
ADD COLUMN last_login TIMESTAMPTZ,
ADD COLUMN active BOOLEAN DEFAULT true;

-- Create indexes for better performance
CREATE INDEX idx_therapists_code ON therapists(code);
CREATE INDEX idx_therapists_active ON therapists(active);

-- Update existing therapists to be active
UPDATE therapists SET active = true WHERE active IS NULL;

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_therapists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_therapists_updated_at
  BEFORE UPDATE ON therapists
  FOR EACH ROW
  EXECUTE FUNCTION update_therapists_updated_at();