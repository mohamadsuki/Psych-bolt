/*
  # Add ID number field to clients table

  1. Changes
    - Add `id_number` field to clients table (9 digits, required)
    - Create unique index on id_number
    - Add validation check for 9-digit number
*/

-- Add ID number field to clients table
ALTER TABLE public.clients 
ADD COLUMN id_number VARCHAR(9) NULL;

-- Create a unique index on the id_number field
CREATE UNIQUE INDEX clients_id_number_key ON public.clients (id_number);

-- Add validation check for 9-digit number
ALTER TABLE public.clients 
ADD CONSTRAINT clients_id_number_check 
CHECK (id_number ~ '^[0-9]{9}$');

COMMENT ON COLUMN public.clients.id_number IS 'Israeli ID number (9 digits)';