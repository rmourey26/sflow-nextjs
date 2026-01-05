-- Migration: Add last_synced_at column to accounts table
-- This column tracks when account data was last synced from Plaid

ALTER TABLE public.accounts
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;

-- Add a comment for documentation
COMMENT ON COLUMN public.accounts.last_synced_at IS 'Timestamp of last successful sync with Plaid';
