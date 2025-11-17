import { addDays, differenceInDays } from 'date-fns';

import type { Account, ForecastDay, Recurrence, Transaction } from '@/types';

/**
 * Advanced Forecast Engine with Monte Carlo simulation
 * Generates probabilistic forecasts using historical transaction patterns,
 * recurring items, and variance modeling
 */

type ForecastInput = {
  today: Date;
  accounts: Account[];
  transactions: Transaction[];
  recurrences: Recurrence[];
  buffer: number;
  horizonDays?: number;
  simulations?: number;
};

type RecurrenceProjection = {
  date: Date;
  amount: number;
  name: string;
  confidence: number;
};

/**
 * Simple seeded random number generator for reproducible simulations
 */
function createRng(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 2 ** 32;
    return state / 2 ** 32;
  };
}

/**
 * Calculate mean and standard deviation from transaction history
 */
function analyzeTransactionPatterns(transactions: Transaction[]): {
  dailyMean: number;
  dailyStdDev: number;
  incomePattern: { mean: number; frequency: number };
  expensePattern: { mean: number; frequency: number };
} {
  if (transactions.length === 0) {
    return {
      dailyMean: 0,
      dailyStdDev: 50,
      incomePattern: { mean: 0, frequency: 0 },
      expensePattern: { mean: 0, frequency: 0 },
    };
  }

  // Separate income and expenses
  const incomes = transactions.filter((tx) => tx.amount > 0);
  const expenses = transactions.filter((tx) => tx.amount < 0);

  // Calculate daily patterns
  const sortedDates = transactions.map((tx) => new Date(tx.date)).sort((a, b) => a.getTime() - b.getTime());
  const daySpan = Math.max(1, differenceInDays(sortedDates[sortedDates.length - 1], sortedDates[0]) || 1);

  const totalNet = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const dailyMean = totalNet / daySpan;

  // Calculate standard deviation
  const dailyVariance =
    transactions.reduce((sum, tx) => sum + (tx.amount - dailyMean) ** 2, 0) / Math.max(1, transactions.length - 1);
  const dailyStdDev = Math.sqrt(dailyVariance);

  return {
    dailyMean,
    dailyStdDev: Math.max(20, dailyStdDev), // Minimum volatility
    incomePattern: {
      mean: incomes.length > 0 ? incomes.reduce((sum, tx) => sum + tx.amount, 0) / incomes.length : 0,
      frequency: incomes.length / daySpan,
    },
    expensePattern: {
      mean: expenses.length > 0 ? Math.abs(expenses.reduce((sum, tx) => sum + tx.amount, 0) / expenses.length) : 0,
      frequency: expenses.length / daySpan,
    },
  };
}

/**
 * Project recurrences over the forecast horizon
 */
function projectRecurrences(recurrences: Recurrence[], today: Date, horizonDays: number): RecurrenceProjection[] {
  const projections: RecurrenceProjection[] = [];

  for (const recurrence of recurrences) {
    const cadenceDays: Record<Recurrence['cadence'], number> = {
      weekly: 7,
      biweekly: 14,
      monthly: 30,
      quarterly: 90,
      yearly: 365,
    };

    const intervalDays = cadenceDays[recurrence.cadence];
    let currentDate = new Date(recurrence.nextDate);

    // Confidence multiplier for variance
    const confidenceScore = recurrence.confidence === 'high' ? 0.95 : recurrence.confidence === 'medium' ? 0.8 : 0.6;

    while (differenceInDays(currentDate, today) < horizonDays) {
      if (currentDate >= today) {
        projections.push({
          date: new Date(currentDate),
          amount: recurrence.amount,
          name: recurrence.name,
          confidence: confidenceScore,
        });
      }
      currentDate = addDays(currentDate, intervalDays);
    }
  }

  return projections.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Box-Muller transform for normal distribution sampling
 */
function normalRandom(rng: () => number, mean: number, stdDev: number): number {
  const u1 = rng();
  const u2 = rng();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z0 * stdDev;
}

/**
 * Run a single Monte Carlo simulation
 */
function runSimulation(
  startingBalance: number,
  patterns: ReturnType<typeof analyzeTransactionPatterns>,
  projections: RecurrenceProjection[],
  today: Date,
  horizonDays: number,
  rng: () => number,
): number[] {
  const dailyBalances: number[] = [];
  let balance = startingBalance;

  for (let day = 0; day < horizonDays; day += 1) {
    const currentDate = addDays(today, day);

    // Add scheduled recurrences for this day
    const todaysRecurrences = projections.filter(
      (proj) => differenceInDays(proj.date, currentDate) === 0,
    );

    for (const recurrence of todaysRecurrences) {
      // Add variance based on confidence
      const variance = recurrence.amount * (1 - recurrence.confidence) * 0.2;
      const actualAmount = normalRandom(rng, recurrence.amount, Math.abs(variance));
      balance += actualAmount;
    }

    // Add random daily variance (discretionary spending, unexpected income, etc.)
    const dailyVariance = normalRandom(rng, patterns.dailyMean * 0.1, patterns.dailyStdDev * 0.5);
    balance += dailyVariance;

    dailyBalances.push(balance);
  }

  return dailyBalances;
}

/**
 * Generate forecast with percentile bands using Monte Carlo simulation
 */
export function generateAdvancedForecast({
  today,
  accounts,
  transactions,
  recurrences,
  buffer,
  horizonDays = 90,
  simulations = 1000,
}: ForecastInput): ForecastDay[] {
  // Calculate starting balance
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);

  // Analyze historical patterns
  const patterns = analyzeTransactionPatterns(transactions);

  // Project recurrences
  const projections = projectRecurrences(recurrences, today, horizonDays);

  // Run Monte Carlo simulations
  const allSimulations: number[][] = [];
  for (let sim = 0; sim < simulations; sim += 1) {
    const rng = createRng(sim * 12345 + 67890); // Unique seed per simulation
    const simulation = runSimulation(totalBalance, patterns, projections, today, horizonDays, rng);
    allSimulations.push(simulation);
  }

  // Calculate percentiles for each day
  const forecastDays: ForecastDay[] = [];

  for (let day = 0; day < horizonDays; day += 1) {
    const dayBalances = allSimulations.map((sim) => sim[day]).sort((a, b) => a - b);

    const p10Index = Math.floor(simulations * 0.1);
    const p50Index = Math.floor(simulations * 0.5);
    const p90Index = Math.floor(simulations * 0.9);

    const p10Total = dayBalances[p10Index];
    const p50Total = dayBalances[p50Index];
    const p90Total = dayBalances[p90Index];

    // Distribute across accounts (proportionally based on current balances)
    const byAccount = accounts.map((account) => {
      const proportion = totalBalance > 0 ? account.currentBalance / totalBalance : 1 / accounts.length;
      return {
        accountId: account.id,
        p50: p50Total * proportion,
        p10: p10Total * proportion,
        p90: p90Total * proportion,
      };
    });

    forecastDays.push({
      date: addDays(today, day).toISOString(),
      p50Total: Math.round(p50Total * 100) / 100,
      p10Total: Math.round(p10Total * 100) / 100,
      p90Total: Math.round(p90Total * 100) / 100,
      byAccount,
    });
  }

  return forecastDays;
}

/**
 * Calculate forecast confidence based on data quality and variance
 */
export function calculateForecastConfidence(
  transactions: Transaction[],
  recurrences: Recurrence[],
  forecastDays: ForecastDay[],
): number {
  // Factor 1: Historical data depth (more data = higher confidence)
  const dataDepthScore = Math.min(100, (transactions.length / 30) * 100);

  // Factor 2: Recurrence confidence
  const avgRecurrenceConfidence =
    recurrences.length > 0
      ? recurrences.reduce((sum, r) => {
          return sum + (r.confidence === 'high' ? 100 : r.confidence === 'medium' ? 70 : 40);
        }, 0) / recurrences.length
      : 50;

  // Factor 3: Band width (narrower = higher confidence)
  const avgBandWidth =
    forecastDays.length > 0
      ? forecastDays.slice(0, 30).reduce((sum, day) => sum + (day.p90Total - day.p10Total), 0) / Math.min(30, forecastDays.length)
      : 1000;
  
  const avgBalance = forecastDays.length > 0 ? forecastDays.slice(0, 30).reduce((sum, day) => sum + day.p50Total, 0) / Math.min(30, forecastDays.length) : 1;
  const bandWidthRatio = avgBandWidth / Math.abs(avgBalance);
  const bandWidthScore = Math.max(0, 100 - bandWidthRatio * 100);

  // Weighted average
  const confidence = dataDepthScore * 0.3 + avgRecurrenceConfidence * 0.4 + bandWidthScore * 0.3;

  return Math.round(Math.max(30, Math.min(100, confidence)));
}
