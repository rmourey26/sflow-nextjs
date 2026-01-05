-- Comprehensive migration to ensure accounts table matches the TypeScript schema
-- This migration adds ALL columns that may be missing from the accounts table

-- Add 'name' column if missing
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'accounts' AND column_name = 'name') THEN
    ALTER TABLE public.accounts ADD COLUMN name TEXT;
    -- Populate name from institution_name or a default
    UPDATE public.accounts SET name = COALESCE(institution_id, 'Bank Account') WHERE name IS NULL;
    ALTER TABLE public.accounts ALTER COLUMN name SET NOT NULL;
  END IF;
END $$;

-- Add 'connected' column if missing
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'accounts' AND column_name = 'connected') THEN
    ALTER TABLE public.accounts ADD COLUMN connected BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

-- Add 'institution_id' column if missing
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'accounts' AND column_name = 'institution_id') THEN
    ALTER TABLE public.accounts ADD COLUMN institution_id TEXT;
  END IF;
END $$;

-- Add 'last_synced_at' column if missing
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'accounts' AND column_name = 'last_synced_at') THEN
    ALTER TABLE public.accounts ADD COLUMN last_synced_at TIMESTAMPTZ;
  END IF;
END $$;

-- Add 'plaid_account_id' column if missing
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'accounts' AND column_name = 'plaid_account_id') THEN
    ALTER TABLE public.accounts ADD COLUMN plaid_account_id TEXT;
  END IF;
END $$;

-- Add 'plaid_access_token' column if missing
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'accounts' AND column_name = 'plaid_access_token') THEN
    ALTER TABLE public.accounts ADD COLUMN plaid_access_token TEXT;
  END IF;
END $$;

-- Add 'plaid_item_id' column if missing (the current error)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'accounts' AND column_name = 'plaid_item_id') THEN
    ALTER TABLE public.accounts ADD COLUMN plaid_item_id TEXT;
  END IF;
END $$;

-- Create indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_plaid_item_id ON public.accounts(plaid_item_id);
CREATE INDEX IF NOT EXISTS idx_accounts_plaid_account_id ON public.accounts(plaid_account_id);
CREATE INDEX IF NOT EXISTS idx_accounts_institution_id ON public.accounts(institution_id);

-- Verify the schema is complete (this will show which columns exist)
DO $$
DECLARE
  col_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO col_count 
  FROM information_schema.columns 
  WHERE table_schema = 'public' AND table_name = 'accounts';
  
  RAISE NOTICE 'Accounts table now has % columns', col_count;
END $$;
