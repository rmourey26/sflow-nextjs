import { addDays } from 'date-fns';

import type { Account, FlowState, ForecastDay, Recurrence, Suggestion, Transaction } from '@/types';

type MockOptions = {
  seed?: string;
  monthlyIncome?: number;
  buffer?: number;
  bills?: Array<{ name: string; amount: number; cadence: Recurrence['cadence']; dueInDays: number }>;
};

function createSeed(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i += 1) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    const t = (h ^= h >>> 16) >>> 0;
    return t / 4294967295;
  };
}

function roundCurrency(value: number, precision = 2) {
  return Math.round(value * 10 ** precision) / 10 ** precision;
}

export function generateMockFlowState(options: MockOptions = {}): FlowState {
  const { seed = 'saverflow', monthlyIncome = 5200, buffer = 500, bills = [] } = options;
  const random = createSeed(seed);
  const today = new Date();
  const currency = 'USD';

  const accounts: Account[] = [
    {
      id: 'acc-checking',
      name: 'Everyday Checking',
      type: 'checking',
      currentBalance: 4250,
      currency,
    },
    {
      id: 'acc-savings',
      name: 'Safety Net Savings',
      type: 'savings',
      currentBalance: 8100,
      currency,
    },
  ];

  const baseRecurrences: Recurrence[] = [
    {
      name: 'Rent',
      amount: -2100,
      cadence: 'monthly',
      nextDate: addDays(today, 12).toISOString(),
      confidence: 'high',
    },
    ...(monthlyIncome
      ? [
          {
            name: 'Primary income',
            amount: monthlyIncome,
            cadence: 'monthly' as const,
            nextDate: addDays(today, 5).toISOString(),
            confidence: 'high' as const,
          },
        ]
      : []),
    {
      name: 'Groceries',
      amount: -180,
      cadence: 'weekly',
      nextDate: addDays(today, 3).toISOString(),
      confidence: 'medium',
    },
    {
      name: 'Subscriptions',
      amount: -96,
      cadence: 'monthly',
      nextDate: addDays(today, 9).toISOString(),
      confidence: 'medium',
    },
    {
      name: 'Utilities',
      amount: -140,
      cadence: 'monthly',
      nextDate: addDays(today, 15).toISOString(),
      confidence: 'high',
    },
  ];

  const additionalRecurrences: Recurrence[] = bills.map((bill) => ({
    name: bill.name,
    amount: bill.amount,
    cadence: bill.cadence,
    nextDate: addDays(today, bill.dueInDays).toISOString(),
    confidence: 'medium',
  }));

  const recurrences: Recurrence[] = [...baseRecurrences, ...additionalRecurrences];

  // Generate more realistic transaction history (30 days)
  const transactions: Transaction[] = [];
  const merchantNames = [
    { name: 'Amazon', category: 'shopping', minAmount: 15, maxAmount: 150 },
    { name: 'Starbucks', category: 'food', minAmount: 5, maxAmount: 25 },
    { name: 'Whole Foods', category: 'food', minAmount: 40, maxAmount: 180 },
    { name: 'Shell Gas Station', category: 'transportation', minAmount: 35, maxAmount: 65 },
    { name: 'Netflix', category: 'entertainment', minAmount: 15, maxAmount: 20 },
    { name: 'Gym Membership', category: 'healthcare', minAmount: 45, maxAmount: 60 },
    { name: 'Electric Company', category: 'utilities', minAmount: 80, maxAmount: 150 },
    { name: 'Target', category: 'shopping', minAmount: 25, maxAmount: 120 },
  ];

  for (let day = 0; day < 30; day += 1) {
    // Random 2-4 transactions per day
    const txCount = Math.floor(random() * 3) + 2;
    for (let tx = 0; tx < txCount; tx += 1) {
      const merchant = merchantNames[Math.floor(random() * merchantNames.length)];
      const amount = -(merchant.minAmount + random() * (merchant.maxAmount - merchant.minAmount));
      
      transactions.push({
        id: `tx-${day}-${tx}`,
        accountId: random() > 0.7 ? 'acc-savings' : 'acc-checking',
        date: addDays(today, -day).toISOString(),
        amount: roundCurrency(amount),
        merchant: merchant.name,
        category: merchant.category,
      });
    }
    
    // Occasional income
    if (day % 14 === 0 && day > 0) {
      transactions.push({
        id: `tx-income-${day}`,
        accountId: 'acc-checking',
        date: addDays(today, -day).toISOString(),
        amount: roundCurrency(monthlyIncome / 2),
        merchant: 'Payroll Deposit',
        category: 'income',
      });
    }
  }

  let runningBalance = accounts.reduce((total, account) => total + account.currentBalance, 0);
  const forecastDays: ForecastDay[] = [];

  for (let day = 0; day < 90; day += 1) {
    const date = addDays(today, day);
    const drift = (random() - 0.4) * 180;
    const p50 = runningBalance + drift;
    const bandSpread = 280 + random() * 120;
    const p10 = p50 - bandSpread;
    const p90 = p50 + bandSpread;
    runningBalance = p50;

    forecastDays.push({
      date: date.toISOString(),
      p50Total: roundCurrency(p50),
      p10Total: roundCurrency(p10),
      p90Total: roundCurrency(p90),
      byAccount: accounts.map((account, idx) => {
        const mixFactor = 0.6 + random() * 0.4;
        const base = account.currentBalance + drift * (idx === 0 ? mixFactor : 1 - mixFactor);
        return {
          accountId: account.id,
          p50: roundCurrency(base),
          p10: roundCurrency(base - bandSpread * 0.4),
          p90: roundCurrency(base + bandSpread * 0.4),
        };
      }),
    });
  }

  const suggestion: Suggestion = {
    id: 'suggestion-smart-save',
    title: 'Move $25 to savings on Friday',
    action: 'transfer',
    transferAmount: 25,
    date: addDays(today, 5).toISOString(),
    expectedRunwayChangeDays: 3,
    rationale: 'Based on your forecast we can tuck away a little without getting too tight next week.',
    status: 'pending',
  };

  return {
    today: today.toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    currency,
    userBuffer: buffer,
    accounts,
    transactions,
    recurrences,
    forecastDays,
    suggestion,
    runwayDays: 46,
    confidence: 84,
    risks: [
      {
        id: 'risk-1',
        title: 'Large annual subscription due',
        description: 'Your design tools renew on December 12 for $320.',
        date: addDays(today, 32).toISOString(),
        severity: 'warning',
      },
      {
        id: 'risk-2',
        title: 'Rent increases next month',
        description: 'Budget an extra $120 for rent in January.',
        date: addDays(today, 40).toISOString(),
        severity: 'info',
      },
    ],
  };
}
