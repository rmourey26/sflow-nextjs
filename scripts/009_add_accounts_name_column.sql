-- Migration: Add name column to accounts table
-- This column stores the account name from Plaid or user-provided name

ALTER TABLE accounts ADD COLUMN IF NOT EXISTS name TEXT;

-- Update existing accounts to use institution_name as name if available
UPDATE accounts SET name = institution_name WHERE name IS NULL AND institution_name IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN accounts.name IS 'Account name from Plaid or user-provided';
