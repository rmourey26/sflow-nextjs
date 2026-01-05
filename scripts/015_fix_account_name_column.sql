-- Migration: Fix account_name column naming mismatch
-- The codebase uses 'name' but the database may have 'account_name'

DO $$
BEGIN
    -- Check if account_name exists and name doesn't
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'accounts' 
        AND column_name = 'account_name'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'accounts' 
        AND column_name = 'name'
    ) THEN
        -- Rename account_name to name
        ALTER TABLE public.accounts RENAME COLUMN account_name TO name;
        RAISE NOTICE 'Renamed account_name to name';
    END IF;

    -- If both columns exist, copy data from account_name to name and drop account_name
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'accounts' 
        AND column_name = 'account_name'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'accounts' 
        AND column_name = 'name'
    ) THEN
        -- Update name with account_name values where name is null
        UPDATE public.accounts SET name = account_name WHERE name IS NULL AND account_name IS NOT NULL;
        
        -- Make account_name nullable and set default
        ALTER TABLE public.accounts ALTER COLUMN account_name DROP NOT NULL;
        ALTER TABLE public.accounts ALTER COLUMN account_name SET DEFAULT NULL;
        
        RAISE NOTICE 'Made account_name nullable and migrated data to name';
    END IF;

    -- Ensure name column exists with proper constraints
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'accounts' 
        AND column_name = 'name'
    ) THEN
        ALTER TABLE public.accounts ADD COLUMN name TEXT DEFAULT 'Unnamed Account';
        RAISE NOTICE 'Added name column';
    END IF;
END $$;

-- Ensure name has a default value for future inserts
ALTER TABLE public.accounts ALTER COLUMN name SET DEFAULT 'Unnamed Account';
