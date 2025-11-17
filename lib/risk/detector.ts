import { addDays, differenceInDays, format } from 'date-fns';

import type { ForecastDay, Recurrence, RiskAlert, Transaction } from '@/types';

/**
 * Automatic Risk Detection System
 * Analyzes transactions, recurrences, and forecasts to identify potential financial risks
 */

type RiskDetectionInput = {
  today: Date;
  forecastDays: ForecastDay[];
  transactions: Transaction[];
  recurrences: Recurrence[];
  runwayDays: number;
  currentBalance: number;
};

/**
 * Detect when balance will go below critical threshold
 */
function detectLowBalanceRisks(forecastDays: ForecastDay[], today: Date, threshold = 500): RiskAlert[] {
  const risks: RiskAlert[] = [];

  for (let i = 0; i < forecastDays.length; i += 1) {
    const day = forecastDays[i];

    // Check P10 (conservative estimate)
    if (day.p10Total < threshold && day.p10Total > 0) {
      // Only alert if it's the first occurrence in this period
      if (i === 0 || forecastDays[i - 1].p10Total >= threshold) {
        risks.push({
          id: `low-balance-${i}`,
          title: 'Balance may run low',
          description: `In the conservative scenario, your balance could drop to $${Math.round(day.p10Total)} around ${format(new Date(day.date), 'MMMM d')}.`,
          date: day.date,
          severity: day.p10Total < 200 ? 'critical' : 'warning',
        });
      }
    }

    // Check for negative balance
    if (day.p10Total <= 0) {
      if (i === 0 || forecastDays[i - 1].p10Total > 0) {
        risks.push({
          id: `negative-balance-${i}`,
          title: 'Potential overdraft',
          description: `Risk of overdraft around ${format(new Date(day.date), 'MMMM d')}. Consider reducing expenses or moving funds.`,
          date: day.date,
          severity: 'critical',
        });
      }
      break; // Only report first occurrence
    }
  }

  return risks;
}

/**
 * Detect large upcoming bills that may strain cash flow
 */
function detectLargeBillRisks(
  recurrences: Recurrence[],
  today: Date,
  currentBalance: number,
  horizonDays = 90,
): RiskAlert[] {
  const risks: RiskAlert[] = [];
  const averageExpense = Math.abs(
    recurrences.filter((r) => r.amount < 0).reduce((sum, r) => sum + r.amount, 0) / 
    Math.max(1, recurrences.filter((r) => r.amount < 0).length)
  );

  // Large bill threshold: 3x average expense or 30% of current balance
  const largeThreshold = Math.max(averageExpense * 3, currentBalance * 0.3, 500);

  for (const recurrence of recurrences) {
    const daysUntil = differenceInDays(new Date(recurrence.nextDate), today);

    if (daysUntil >= 0 && daysUntil <= horizonDays && Math.abs(recurrence.amount) >= largeThreshold) {
      const impactPercent = Math.round((Math.abs(recurrence.amount) / currentBalance) * 100);

      risks.push({
        id: `large-bill-${recurrence.name.toLowerCase().replace(/\s+/g, '-')}`,
        title: `Large ${recurrence.amount < 0 ? 'payment' : 'deposit'} coming`,
        description: `${recurrence.name} of $${Math.abs(recurrence.amount).toLocaleString()} due ${format(new Date(recurrence.nextDate), 'MMMM d')} (${impactPercent}% of current balance).`,
        date: recurrence.nextDate,
        severity: impactPercent > 50 ? 'critical' : impactPercent > 30 ? 'warning' : 'info',
      });
    }
  }

  return risks;
}

/**
 * Detect declining runway trend
 */
function detectRunwayTrends(forecastDays: ForecastDay[], runwayDays: number, threshold = 500): RiskAlert[] {
  const risks: RiskAlert[] = [];

  if (runwayDays < 14) {
    // Calculate when runway might reach critical level
    let criticalDay: ForecastDay | null = null;
    for (const day of forecastDays) {
      if (day.p50Total < threshold) {
        criticalDay = day;
        break;
      }
    }

    if (criticalDay) {
      risks.push({
        id: 'runway-critical',
        title: 'Runway below two weeks',
        description: `Your financial runway is ${runwayDays} days. Consider reducing discretionary spending or securing additional income.`,
        date: criticalDay.date,
        severity: runwayDays < 7 ? 'critical' : 'warning',
      });
    }
  }

  return risks;
}

/**
 * Detect irregular spending spikes
 */
function detectSpendingAnomalies(transactions: Transaction[], today: Date): RiskAlert[] {
  const risks: RiskAlert[] = [];

  // Group transactions by week
  const recentWeeks: Transaction[][] = [[], [], [], []];
  
  for (const transaction of transactions) {
    const daysAgo = differenceInDays(today, new Date(transaction.date));
    if (daysAgo >= 0 && daysAgo < 28) {
      const weekIndex = Math.floor(daysAgo / 7);
      if (weekIndex < 4) {
        recentWeeks[weekIndex].push(transaction);
      }
    }
  }

  // Calculate average weekly spending (expenses only)
  const weeklySpending = recentWeeks.map((week) =>
    Math.abs(week.filter((tx) => tx.amount < 0).reduce((sum, tx) => sum + tx.amount, 0))
  );

  const avgSpending = weeklySpending.reduce((sum, val) => sum + val, 0) / weeklySpending.length;
  const stdDev = Math.sqrt(
    weeklySpending.reduce((sum, val) => sum + (val - avgSpending) ** 2, 0) / weeklySpending.length
  );

  // Check most recent week
  if (weeklySpending[0] > avgSpending + 2 * stdDev && stdDev > 0) {
    const spikeAmount = weeklySpending[0] - avgSpending;
    risks.push({
      id: 'spending-spike',
      title: 'Spending above normal',
      description: `Last week's spending was $${Math.round(spikeAmount)} higher than usual. Review recent transactions.`,
      date: today.toISOString(),
      severity: 'warning',
    });
  }

  return risks;
}

/**
 * Detect concentration risk (too much in one account)
 */
function detectConcentrationRisk(forecastDays: ForecastDay[], today: Date): RiskAlert[] {
  const risks: RiskAlert[] = [];

  if (forecastDays.length === 0 || !forecastDays[0].byAccount || forecastDays[0].byAccount.length < 2) {
    return risks;
  }

  // Check current distribution
  const currentDay = forecastDays[0];
  const totalP50 = currentDay.p50Total;

  for (const account of currentDay.byAccount) {
    const concentration = Math.abs(account.p50 / totalP50);

    if (concentration > 0.85 && totalP50 > 1000) {
      risks.push({
        id: `concentration-${account.accountId}`,
        title: 'High account concentration',
        description: `${Math.round(concentration * 100)}% of your funds are in one account. Consider diversifying for better protection.`,
        date: today.toISOString(),
        severity: 'info',
      });
      break; // Only show once
    }
  }

  return risks;
}

/**
 * Main risk detection function
 */
export function detectRisks({
  today,
  forecastDays,
  transactions,
  recurrences,
  runwayDays,
  currentBalance,
}: RiskDetectionInput): RiskAlert[] {
  const allRisks: RiskAlert[] = [
    ...detectLowBalanceRisks(forecastDays, today),
    ...detectLargeBillRisks(recurrences, today, currentBalance),
    ...detectRunwayTrends(forecastDays, runwayDays),
    ...detectSpendingAnomalies(transactions, today),
    ...detectConcentrationRisk(forecastDays, today),
  ];

  // Sort by severity and date
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  allRisks.sort((a, b) => {
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // Limit to top 5 most important risks
  return allRisks.slice(0, 5);
}

/**
 * Calculate risk score (0-100, higher = more risk)
 */
export function calculateRiskScore(risks: RiskAlert[], runwayDays: number): number {
  let score = 0;

  // Base score from runway
  if (runwayDays < 7) score += 40;
  else if (runwayDays < 14) score += 25;
  else if (runwayDays < 30) score += 10;

  // Add points for each risk
  for (const risk of risks) {
    if (risk.severity === 'critical') score += 20;
    else if (risk.severity === 'warning') score += 10;
    else score += 3;
  }

  return Math.min(100, score);
}
