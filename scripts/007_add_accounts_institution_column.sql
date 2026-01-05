-- Migration: Add institution_id column to accounts table
-- This column stores the Plaid institution ID for connected bank accounts

-- Add institution_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'accounts' 
    AND column_name = 'institution_id'
  ) THEN
    ALTER TABLE public.accounts ADD COLUMN institution_id TEXT;
  END IF;
END $$;

-- Add index for faster lookups by institution
CREATE INDEX IF NOT EXISTS idx_accounts_institution_id ON public.accounts(institution_id);

-- Add comment for documentation
COMMENT ON COLUMN public.accounts.institution_id IS 'Plaid institution ID for connected bank accounts';
