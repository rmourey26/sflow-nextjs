-- Migration: Add plaid_account_id column to accounts table
-- This column stores the Plaid account ID for linked bank accounts

-- Add plaid_account_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'accounts' 
    AND column_name = 'plaid_account_id'
  ) THEN
    ALTER TABLE public.accounts ADD COLUMN plaid_account_id TEXT;
    
    -- Add index for faster lookups by plaid_account_id
    CREATE INDEX IF NOT EXISTS idx_accounts_plaid_account_id ON public.accounts(plaid_account_id);
    
    RAISE NOTICE 'Added plaid_account_id column to accounts table';
  ELSE
    RAISE NOTICE 'plaid_account_id column already exists in accounts table';
  END IF;
END $$;
