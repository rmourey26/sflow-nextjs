-- Add Plaid and Stripe fields to existing tables

-- Add Plaid fields to accounts table
ALTER TABLE public.accounts 
ADD COLUMN IF NOT EXISTS plaid_account_id TEXT,
ADD COLUMN IF NOT EXISTS plaid_access_token TEXT,
ADD COLUMN IF NOT EXISTS plaid_item_id TEXT;

-- Add Stripe customer ID to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Create index for Plaid lookups
CREATE INDEX IF NOT EXISTS idx_accounts_plaid_item_id ON public.accounts(plaid_item_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON public.users(stripe_customer_id);
