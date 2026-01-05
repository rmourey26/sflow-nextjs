-- Migration: Add type column to accounts table
-- This column stores the account type (checking, savings, credit, investment, loan, other)

-- Add type column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'accounts' 
        AND column_name = 'type'
    ) THEN
        ALTER TABLE public.accounts 
        ADD COLUMN type text NOT NULL DEFAULT 'checking';
        
        RAISE NOTICE 'Added type column to accounts table';
    ELSE
        RAISE NOTICE 'type column already exists';
    END IF;
END $$;

-- Add check constraint for valid account types
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'accounts_type_check' 
        AND table_name = 'accounts'
    ) THEN
        ALTER TABLE public.accounts 
        ADD CONSTRAINT accounts_type_check 
        CHECK (type IN ('checking', 'savings', 'credit', 'investment', 'loan', 'other', 'depository', 'credit card', 'brokerage', 'mortgage'));
        
        RAISE NOTICE 'Added type check constraint';
    END IF;
END $$;

-- Create index on type for filtering
CREATE INDEX IF NOT EXISTS idx_accounts_type ON public.accounts(type);
