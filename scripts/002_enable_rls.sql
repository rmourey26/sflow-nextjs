-- Enable Row Level Security on all tables

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Accounts table policies
CREATE POLICY "Users can view their own accounts" ON public.accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own accounts" ON public.accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own accounts" ON public.accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own accounts" ON public.accounts FOR DELETE USING (auth.uid() = user_id);

-- Transactions table policies
CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM public.accounts WHERE id = account_id)
);
CREATE POLICY "Users can insert their own transactions" ON public.transactions FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT user_id FROM public.accounts WHERE id = account_id)
);
CREATE POLICY "Users can update their own transactions" ON public.transactions FOR UPDATE USING (
  auth.uid() IN (SELECT user_id FROM public.accounts WHERE id = account_id)
);
CREATE POLICY "Users can delete their own transactions" ON public.transactions FOR DELETE USING (
  auth.uid() IN (SELECT user_id FROM public.accounts WHERE id = account_id)
);

-- Savings Goals table policies
CREATE POLICY "Users can view their own goals" ON public.savings_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own goals" ON public.savings_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own goals" ON public.savings_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own goals" ON public.savings_goals FOR DELETE USING (auth.uid() = user_id);

-- Forecasts table policies
CREATE POLICY "Users can view their own forecasts" ON public.forecasts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own forecasts" ON public.forecasts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own forecasts" ON public.forecasts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own forecasts" ON public.forecasts FOR DELETE USING (auth.uid() = user_id);

-- Financial Profiles table policies
CREATE POLICY "Users can view their own profile" ON public.financial_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.financial_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.financial_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Smart Actions table policies
CREATE POLICY "Users can view their own actions" ON public.smart_actions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own actions" ON public.smart_actions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own actions" ON public.smart_actions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own actions" ON public.smart_actions FOR DELETE USING (auth.uid() = user_id);

-- Organizations table policies (owner only)
CREATE POLICY "Users can view their own organizations" ON public.organizations FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert their own organizations" ON public.organizations FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update their own organizations" ON public.organizations FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete their own organizations" ON public.organizations FOR DELETE USING (auth.uid() = owner_id);
