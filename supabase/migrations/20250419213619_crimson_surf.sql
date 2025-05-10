/*
  # Add address field to clients table

  1. Changes
    - Add address field to the clients table to store client address information
*/

-- Add the address field to the clients table
ALTER TABLE public.clients
ADD COLUMN address TEXT;

COMMENT ON COLUMN public.clients.address IS 'Client residential address';