-- Migration: Add 'connected' column to accounts table
-- This column tracks whether the account is connected via Plaid

-- Add the connected column if it doesn't exist
ALTER TABLE public.accounts 
ADD COLUMN IF NOT EXISTS connected BOOLEAN NOT NULL DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.accounts.connected IS 'Indicates whether the account is connected via Plaid for automatic syncing';
