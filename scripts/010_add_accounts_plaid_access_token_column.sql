-- Migration: Add plaid_access_token column to accounts table
-- This column stores the encrypted Plaid access token for each connected account

-- Add the plaid_access_token column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'accounts' AND column_name = 'plaid_access_token'
    ) THEN
        ALTER TABLE accounts ADD COLUMN plaid_access_token TEXT;
        
        -- Add a comment for documentation
        COMMENT ON COLUMN accounts.plaid_access_token IS 'Encrypted Plaid access token for syncing account data';
    END IF;
END $$;
