# Supabase Integration Setup

This document explains the Supabase database integration and SSR authentication setup for SaverFlow.

## Database Schema

The database includes the following tables:

- **users** - User profiles extending auth.users
- **accounts** - Bank accounts
- **transactions** - Financial transactions
- **savings_goals** - Savings goals and contributions
- **forecasts** - Cash flow forecasting data
- **financial_profiles** - User financial health scores
- **smart_actions** - AI-powered action recommendations
- **organizations** - Business plan organizations

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data.

## Running Migrations

The SQL migration scripts are in the `/scripts` folder:

1. **001_create_schema.sql** - Creates all database tables and indexes
2. **002_enable_rls.sql** - Enables RLS and creates security policies
3. **003_create_user_trigger.sql** - Auto-creates user profile on signup

To run these scripts, you can execute them directly from v0 or use the Supabase dashboard SQL editor.

## Authentication

### SSR Auth Setup

The app uses Supabase SSR authentication with:

- **Client-side**: `lib/supabase/client.ts` - Browser client for client components
- **Server-side**: `lib/supabase/server.ts` - Server client for server components and actions
- **Middleware**: `middleware.ts` & `lib/supabase/middleware.ts` - Session refresh and route protection

### Protected Routes

The middleware automatically protects these routes:
- `/dashboard` - User dashboard
- `/goals` - Savings goals
- `/insights` - Financial insights
- `/settings` - User settings

Unauthenticated users are redirected to `/auth/login`.

### Auth Pages

- `/auth/login` - Sign in with email/password
- `/auth/signup` - Create new account
- `/auth/verify-email` - Email verification confirmation

## Server Actions

All database operations are implemented as server actions in `/lib/actions`:

### User Actions (`user.ts`)
- `getCurrentUser()` - Get current user profile
- `updateUserProfile(updates)` - Update user profile
- `exportUserData()` - Export all user data (GDPR)
- `deleteUserAccount()` - Delete account and all data

### Account Actions (`accounts.ts`)
- `getAccounts()` - List user accounts
- `createAccount(account)` - Create new account
- `updateAccount(id, updates)` - Update account
- `deleteAccount(id)` - Delete account

### Transaction Actions (`transactions.ts`)
- `getTransactions(accountId?, limit, offset)` - List transactions
- `createTransaction(transaction)` - Create transaction
- `updateTransaction(id, updates)` - Update transaction
- `deleteTransaction(id)` - Delete transaction

### Goals Actions (`goals.ts`)
- `getGoals()` - List savings goals
- `createGoal(goal)` - Create new goal
- `updateGoal(id, updates)` - Update goal
- `contributeToGoal(id, amount)` - Add contribution
- `deleteGoal(id)` - Delete goal

### Forecast Actions (`forecasts.ts`)
- `getForecast(horizonDays)` - Get forecast for specific period
- `getAllForecasts()` - Get all forecasts (90, 180, 365 days)
- `createForecast(forecast)` - Generate new forecast

### Smart Actions (`smart-actions.ts`)
- `getSmartActions(status?)` - List smart action suggestions
- `createSmartAction(action)` - Create new suggestion
- `updateSmartAction(id, updates)` - Update action
- `acceptSmartAction(id)` - Accept suggestion
- `dismissSmartAction(id)` - Dismiss suggestion

## TypeScript Types

All database types are defined in `types/database.ts` and match the SQL schema exactly. These types are used throughout the server actions for type safety.

## Row Level Security

All tables use RLS policies that ensure:
- Users can only view their own data
- Users can only create/update/delete their own records
- Transactions are protected through account ownership
- No data leakage between users

Example policy:
\`\`\`sql
CREATE POLICY "Users can view their own accounts" 
ON public.accounts FOR SELECT 
USING (auth.uid() = user_id);
\`\`\`

## Environment Variables

Required environment variables (automatically set by v0):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for admin operations)

Optional:
- `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` - Redirect URL for development

## Security Best Practices

1. Always use server actions for database operations
2. Never expose service role key to client
3. Verify user authentication in all server actions
4. Use RLS policies for all user data tables
5. Validate user ownership before mutations
6. Use TypeScript types for type safety
