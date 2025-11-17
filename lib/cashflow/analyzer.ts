import { addDays, addWeeks, differenceInDays, format, isWithinInterval, startOfWeek } from 'date-fns';

import type { ForecastDay, Recurrence, Transaction } from '@/types';

/**
 * Comprehensive Cash Flow Analysis Engine
 * Provides detailed insights into income, expenses, trends, and patterns
 */

export type CashFlowSummary = {
  period: {
    start: Date;
    end: Date;
    days: number;
  };
  income: {
    total: number;
    average: number;
    count: number;
    sources: Array<{ name: string; amount: number; count: number }>;
  };
  expenses: {
    total: number;
    average: number;
    count: number;
    categories: Array<{ category: string; amount: number; percentage: number }>;
  };
  net: {
    total: number;
    average: number;
    trend: 'improving' | 'stable' | 'declining';
  };
  volatility: {
    score: number; // 0-100, higher = more volatile
    description: string;
  };
};

export type TrendAnalysis = {
  direction: 'up' | 'down' | 'stable';
  strength: number; // 0-1
  confidence: number; // 0-1
  predictedChange: number; // dollars per period
  description: string;
};

/**
 * Analyze cash flow for a specific period
 */
export function analyzeCashFlow(
  transactions: Transaction[],
  startDate: Date,
  endDate: Date,
): CashFlowSummary {
  const periodTransactions = transactions.filter((tx) =>
    isWithinInterval(new Date(tx.date), { start: startDate, end: endDate })
  );

  const days = Math.max(1, differenceInDays(endDate, startDate));

  // Separate income and expenses
  const incomeTransactions = periodTransactions.filter((tx) => tx.amount > 0);
  const expenseTransactions = periodTransactions.filter((tx) => tx.amount < 0);

  // Income analysis
  const totalIncome = incomeTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const incomeSources = new Map<string, { amount: number; count: number }>();

  for (const tx of incomeTransactions) {
    const current = incomeSources.get(tx.merchant) || { amount: 0, count: 0 };
    incomeSources.set(tx.merchant, {
      amount: current.amount + tx.amount,
      count: current.count + 1,
    });
  }

  const incomeSourcesArray = Array.from(incomeSources.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.amount - a.amount);

  // Expense analysis
  const totalExpenses = Math.abs(expenseTransactions.reduce((sum, tx) => sum + tx.amount, 0));
  const expenseCategories = new Map<string, number>();

  for (const tx of expenseTransactions) {
    const category = tx.category || 'other';
    expenseCategories.set(category, (expenseCategories.get(category) || 0) + Math.abs(tx.amount));
  }

  const expenseCategoriesArray = Array.from(expenseCategories.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Net analysis
  const netTotal = totalIncome - totalExpenses;
  const netAverage = netTotal / days;

  // Calculate trend
  const midPoint = new Date((startDate.getTime() + endDate.getTime()) / 2);
  const firstHalf = periodTransactions.filter((tx) => new Date(tx.date) < midPoint);
  const secondHalf = periodTransactions.filter((tx) => new Date(tx.date) >= midPoint);

  const firstHalfNet = firstHalf.reduce((sum, tx) => sum + tx.amount, 0);
  const secondHalfNet = secondHalf.reduce((sum, tx) => sum + tx.amount, 0);

  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (secondHalfNet > firstHalfNet * 1.1) trend = 'improving';
  else if (secondHalfNet < firstHalfNet * 0.9) trend = 'declining';

  // Volatility calculation
  const dailyAmounts: number[] = [];
  for (let day = 0; day < days; day += 1) {
    const dayStart = addDays(startDate, day);
    const dayEnd = addDays(dayStart, 1);
    const dayTxs = periodTransactions.filter((tx) =>
      isWithinInterval(new Date(tx.date), { start: dayStart, end: dayEnd })
    );
    const dayTotal = dayTxs.reduce((sum, tx) => sum + tx.amount, 0);
    dailyAmounts.push(dayTotal);
  }

  const avgDaily = dailyAmounts.reduce((sum, val) => sum + val, 0) / days;
  const variance = dailyAmounts.reduce((sum, val) => sum + (val - avgDaily) ** 2, 0) / days;
  const stdDev = Math.sqrt(variance);
  const volatilityScore = Math.min(100, (stdDev / Math.max(1, Math.abs(avgDaily))) * 100);

  let volatilityDescription = 'Low';
  if (volatilityScore > 70) volatilityDescription = 'Very High';
  else if (volatilityScore > 50) volatilityDescription = 'High';
  else if (volatilityScore > 30) volatilityDescription = 'Moderate';

  return {
    period: {
      start: startDate,
      end: endDate,
      days,
    },
    income: {
      total: Math.round(totalIncome * 100) / 100,
      average: Math.round((totalIncome / days) * 100) / 100,
      count: incomeTransactions.length,
      sources: incomeSourcesArray,
    },
    expenses: {
      total: Math.round(totalExpenses * 100) / 100,
      average: Math.round((totalExpenses / days) * 100) / 100,
      count: expenseTransactions.length,
      categories: expenseCategoriesArray,
    },
    net: {
      total: Math.round(netTotal * 100) / 100,
      average: Math.round(netAverage * 100) / 100,
      trend,
    },
    volatility: {
      score: Math.round(volatilityScore),
      description: volatilityDescription,
    },
  };
}

/**
 * Analyze trend direction and strength
 */
export function analyzeTrend(
  forecastDays: ForecastDay[],
  metric: 'balance' | 'runway' = 'balance',
): TrendAnalysis {
  if (forecastDays.length < 7) {
    return {
      direction: 'stable',
      strength: 0,
      confidence: 0,
      predictedChange: 0,
      description: 'Insufficient data for trend analysis',
    };
  }

  // Use first 30 days for trend analysis
  const dataPoints = forecastDays.slice(0, Math.min(30, forecastDays.length));
  const values = dataPoints.map((day) => day.p50Total);

  // Simple linear regression
  const n = values.length;
  const xSum = (n * (n - 1)) / 2; // Sum of 0,1,2,...,n-1
  const ySum = values.reduce((sum, val) => sum + val, 0);
  const xySum = values.reduce((sum, val, idx) => sum + val * idx, 0);
  const xxSum = (n * (n - 1) * (2 * n - 1)) / 6; // Sum of squares

  const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum);
  const intercept = (ySum - slope * xSum) / n;

  // Calculate R-squared for confidence
  const yMean = ySum / n;
  const ssTotal = values.reduce((sum, val) => sum + (val - yMean) ** 2, 0);
  const ssResidual = values.reduce((sum, val, idx) => sum + (val - (slope * idx + intercept)) ** 2, 0);
  const rSquared = 1 - ssResidual / ssTotal;

  // Determine direction and strength
  const avgValue = Math.abs(yMean);
  const slopePercent = avgValue > 0 ? (slope / avgValue) * 100 : 0;

  let direction: 'up' | 'down' | 'stable' = 'stable';
  if (slopePercent > 0.5) direction = 'up';
  else if (slopePercent < -0.5) direction = 'down';

  const strength = Math.min(1, Math.abs(slopePercent) / 10);
  const confidence = Math.max(0, Math.min(1, rSquared));

  // Predicted change over 30 days
  const predictedChange = slope * 30;

  let description = '';
  if (direction === 'up') {
    description = `Balance is trending upward by approximately $${Math.abs(predictedChange).toFixed(0)} over the next month.`;
  } else if (direction === 'down') {
    description = `Balance is trending downward by approximately $${Math.abs(predictedChange).toFixed(0)} over the next month.`;
  } else {
    description = 'Balance is relatively stable with no significant trend.';
  }

  return {
    direction,
    strength,
    confidence,
    predictedChange: Math.round(predictedChange * 100) / 100,
    description,
  };
}

/**
 * Calculate burn rate (how fast money is being spent)
 */
export function calculateBurnRate(transactions: Transaction[], days = 30): {
  dailyBurnRate: number;
  weeklyBurnRate: number;
  monthlyBurnRate: number;
  trend: 'increasing' | 'stable' | 'decreasing';
} {
  const today = new Date();
  const recentTransactions = transactions
    .filter((tx) => differenceInDays(today, new Date(tx.date)) <= days && tx.amount < 0)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalBurn = Math.abs(recentTransactions.reduce((sum, tx) => sum + tx.amount, 0));
  const dailyBurnRate = totalBurn / days;

  // Compare first half vs second half
  const midPoint = days / 2;
  const firstHalf = recentTransactions.filter((tx) => differenceInDays(today, new Date(tx.date)) >= midPoint);
  const secondHalf = recentTransactions.filter((tx) => differenceInDays(today, new Date(tx.date)) < midPoint);

  const firstHalfBurn = Math.abs(firstHalf.reduce((sum, tx) => sum + tx.amount, 0)) / midPoint;
  const secondHalfBurn = Math.abs(secondHalf.reduce((sum, tx) => sum + tx.amount, 0)) / midPoint;

  let trend: 'increasing' | 'stable' | 'decreasing' = 'stable';
  if (secondHalfBurn > firstHalfBurn * 1.15) trend = 'increasing';
  else if (secondHalfBurn < firstHalfBurn * 0.85) trend = 'decreasing';

  return {
    dailyBurnRate: Math.round(dailyBurnRate * 100) / 100,
    weeklyBurnRate: Math.round(dailyBurnRate * 7 * 100) / 100,
    monthlyBurnRate: Math.round(dailyBurnRate * 30 * 100) / 100,
    trend,
  };
}

/**
 * Identify recurring income and expense patterns
 */
export function identifyRecurringPatterns(
  transactions: Transaction[],
  minOccurrences = 2,
): Array<{
  merchant: string;
  amount: number;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'irregular';
  confidence: number;
  lastDate: Date;
  nextExpectedDate: Date;
}> {
  // Group by merchant and amount (with tolerance)
  const merchantGroups = new Map<string, Transaction[]>();

  for (const tx of transactions) {
    const existing = merchantGroups.get(tx.merchant) || [];
    existing.push(tx);
    merchantGroups.set(tx.merchant, existing);
  }

  const patterns: Array<{
    merchant: string;
    amount: number;
    frequency: 'weekly' | 'biweekly' | 'monthly' | 'irregular';
    confidence: number;
    lastDate: Date;
    nextExpectedDate: Date;
  }> = [];

  for (const [merchant, txs] of merchantGroups.entries()) {
    if (txs.length < minOccurrences) continue;

    // Sort by date
    const sorted = txs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate intervals
    const intervals: number[] = [];
    for (let i = 1; i < sorted.length; i += 1) {
      intervals.push(differenceInDays(new Date(sorted[i].date), new Date(sorted[i - 1].date)));
    }

    const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
    const intervalStdDev = Math.sqrt(
      intervals.reduce((sum, val) => sum + (val - avgInterval) ** 2, 0) / intervals.length
    );

    // Classify frequency
    let frequency: 'weekly' | 'biweekly' | 'monthly' | 'irregular' = 'irregular';
    if (Math.abs(avgInterval - 7) < 2) frequency = 'weekly';
    else if (Math.abs(avgInterval - 14) < 3) frequency = 'biweekly';
    else if (Math.abs(avgInterval - 30) < 5) frequency = 'monthly';

    // Confidence based on consistency
    const confidence = Math.max(0, 1 - intervalStdDev / avgInterval);

    if (frequency !== 'irregular' && confidence > 0.5) {
      const avgAmount = sorted.reduce((sum, tx) => sum + tx.amount, 0) / sorted.length;
      const lastDate = new Date(sorted[sorted.length - 1].date);
      const nextExpectedDate = addDays(lastDate, Math.round(avgInterval));

      patterns.push({
        merchant,
        amount: Math.round(avgAmount * 100) / 100,
        frequency,
        confidence: Math.round(confidence * 100) / 100,
        lastDate,
        nextExpectedDate,
      });
    }
  }

  return patterns.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Generate weekly summaries
 */
export function generateWeeklySummaries(
  transactions: Transaction[],
  weeks = 4,
): Array<{
  weekStart: Date;
  weekEnd: Date;
  inflow: number;
  outflow: number;
  net: number;
  transactionCount: number;
}> {
  const today = new Date();
  const summaries: Array<{
    weekStart: Date;
    weekEnd: Date;
    inflow: number;
    outflow: number;
    net: number;
    transactionCount: number;
  }> = [];

  for (let weekOffset = weeks - 1; weekOffset >= 0; weekOffset -= 1) {
    const weekStart = startOfWeek(addWeeks(today, -weekOffset), { weekStartsOn: 1 });
    const weekEnd = addDays(weekStart, 6);

    const weekTransactions = transactions.filter((tx) =>
      isWithinInterval(new Date(tx.date), { start: weekStart, end: weekEnd })
    );

    const inflow = weekTransactions.filter((tx) => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0);
    const outflow = Math.abs(weekTransactions.filter((tx) => tx.amount < 0).reduce((sum, tx) => sum + tx.amount, 0));
    const net = inflow - outflow;

    summaries.push({
      weekStart,
      weekEnd,
      inflow: Math.round(inflow * 100) / 100,
      outflow: Math.round(outflow * 100) / 100,
      net: Math.round(net * 100) / 100,
      transactionCount: weekTransactions.length,
    });
  }

  return summaries;
}
