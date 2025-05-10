/*
  # Fix therapist admin system

  1. Changes
    - Remove is_admin column from therapists table
    - Update admin code check to use code='admin123'
    - Ensure proper data migration
*/

-- First remove the is_admin column
ALTER TABLE therapists 
DROP COLUMN IF EXISTS is_admin;

-- Update the admin user to have the correct code
UPDATE therapists 
SET code = 'admin123' 
WHERE name = 'מנהל המערכת';

-- Delete any duplicate admin users
DELETE FROM therapists 
WHERE code = 'admin123' 
AND name != 'מנהל המערכת';

-- Add comment explaining admin system
COMMENT ON TABLE therapists IS 'Therapist records. The therapist with code=admin123 is the system admin.';