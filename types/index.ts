export type AccountType = 'checking' | 'savings' | 'credit' | 'investment' | 'loan';

export type Account = {
  id: string;
  name: string;
  type: AccountType;
  currentBalance: number;
  currency: string;
};

export type Transaction = {
  id: string;
  accountId: string;
  date: string;
  amount: number;
  merchant: string;
  category: string;
};

export type RecurrenceCadence = 'monthly' | 'biweekly' | 'weekly' | 'quarterly' | 'yearly';

export type Recurrence = {
  name: string;
  amount: number;
  cadence: RecurrenceCadence;
  nextDate: string;
  confidence: 'low' | 'medium' | 'high';
};

export type ForecastBand = {
  accountId: string;
  p50: number;
  p10: number;
  p90: number;
};

export type ForecastDay = {
  date: string;
  p50Total: number;
  p10Total: number;
  p90Total: number;
  byAccount: ForecastBand[];
};

export type Suggestion = {
  id: string;
  title: string;
  action: string;
  transferAmount: number;
  date: string;
  expectedRunwayChangeDays: number;
  rationale: string;
  status?: 'pending' | 'accepted' | 'dismissed';
};

export type RiskAlert = {
  id: string;
  title: string;
  description: string;
  date: string;
  severity: 'info' | 'warning' | 'critical';
};

export type FlowState = {
  today: string;
  timezone: string;
  currency: string;
  userBuffer: number;
  accounts: Account[];
  transactions: Transaction[];
  recurrences: Recurrence[];
  forecastDays: ForecastDay[];
  suggestion?: Suggestion;
  runwayDays: number;
  confidence: number;
  risks: RiskAlert[];
};
