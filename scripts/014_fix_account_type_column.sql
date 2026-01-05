-- Migration: Fix account_type column naming
-- This handles the case where the database has 'account_type' instead of 'type'

-- First, check if account_type exists and type doesn't, then rename
DO $$
BEGIN
  -- If account_type exists but type doesn't, rename it to type
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'accounts' AND column_name = 'account_type')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'accounts' AND column_name = 'type') THEN
    ALTER TABLE public.accounts RENAME COLUMN account_type TO type;
    RAISE NOTICE 'Renamed account_type to type';
  END IF;
  
  -- If both exist, drop account_type and keep type
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'accounts' AND column_name = 'account_type')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'accounts' AND column_name = 'type') THEN
    -- Copy data from account_type to type where type is null
    UPDATE public.accounts SET type = account_type WHERE type IS NULL AND account_type IS NOT NULL;
    ALTER TABLE public.accounts DROP COLUMN account_type;
    RAISE NOTICE 'Dropped account_type, kept type';
  END IF;
  
  -- Ensure type column exists with proper constraints
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'accounts' AND column_name = 'type') THEN
    ALTER TABLE public.accounts ADD COLUMN type TEXT NOT NULL DEFAULT 'checking';
    RAISE NOTICE 'Added type column';
  END IF;
END $$;

-- Drop any existing check constraint on type
ALTER TABLE public.accounts DROP CONSTRAINT IF EXISTS accounts_type_check;
ALTER TABLE public.accounts DROP CONSTRAINT IF EXISTS accounts_account_type_check;

-- Add proper check constraint for all account types including Plaid types
ALTER TABLE public.accounts ADD CONSTRAINT accounts_type_check 
  CHECK (type IN ('checking', 'savings', 'credit', 'depository', 'investment', 'brokerage', 'loan', 'mortgage', 'other'));

-- Ensure type is NOT NULL with default
ALTER TABLE public.accounts ALTER COLUMN type SET NOT NULL;
ALTER TABLE public.accounts ALTER COLUMN type SET DEFAULT 'checking';

-- Create index on type for filtering
CREATE INDEX IF NOT EXISTS idx_accounts_type ON public.accounts(type);
