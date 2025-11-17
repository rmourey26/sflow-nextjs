import { differenceInDays } from 'date-fns';

import type { Transaction } from '@/types';

/**
 * Anomaly Detection System for Unusual Transactions
 * Identifies outliers and suspicious patterns in transaction data
 */

export type Anomaly = {
  id: string;
  transaction: Transaction;
  type: 'amount_outlier' | 'frequency_spike' | 'new_merchant' | 'duplicate_suspect' | 'time_anomaly';
  severity: 'low' | 'medium' | 'high';
  description: string;
  confidence: number; // 0-1
};

/**
 * Z-score calculation for outlier detection
 */
function calculateZScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}

/**
 * Detect amount outliers using Z-score method
 */
function detectAmountOutliers(transactions: Transaction[], threshold = 2.5): Anomaly[] {
  const anomalies: Anomaly[] = [];
  
  // Separate income and expenses
  const expenses = transactions.filter((tx) => tx.amount < 0).map((tx) => Math.abs(tx.amount));
  const incomes = transactions.filter((tx) => tx.amount > 0).map((tx) => tx.amount);

  // Analyze expenses
  if (expenses.length > 3) {
    const expenseMean = expenses.reduce((sum, val) => sum + val, 0) / expenses.length;
    const expenseStdDev = Math.sqrt(
      expenses.reduce((sum, val) => sum + (val - expenseMean) ** 2, 0) / expenses.length
    );

    for (const tx of transactions.filter((t) => t.amount < 0)) {
      const absAmount = Math.abs(tx.amount);
      const zScore = calculateZScore(absAmount, expenseMean, expenseStdDev);

      if (Math.abs(zScore) > threshold) {
        const confidenceScore = Math.min(1, Math.abs(zScore) / 5);
        anomalies.push({
          id: `amount-outlier-${tx.id}`,
          transaction: tx,
          type: 'amount_outlier',
          severity: Math.abs(zScore) > 4 ? 'high' : Math.abs(zScore) > 3 ? 'medium' : 'low',
          description: `This $${absAmount.toFixed(2)} expense is ${zScore > 0 ? 'significantly higher' : 'unusually low'} compared to your typical spending (avg: $${expenseMean.toFixed(2)}).`,
          confidence: confidenceScore,
        });
      }
    }
  }

  // Analyze income
  if (incomes.length > 3) {
    const incomeMean = incomes.reduce((sum, val) => sum + val, 0) / incomes.length;
    const incomeStdDev = Math.sqrt(
      incomes.reduce((sum, val) => sum + (val - incomeMean) ** 2, 0) / incomes.length
    );

    for (const tx of transactions.filter((t) => t.amount > 0)) {
      const zScore = calculateZScore(tx.amount, incomeMean, incomeStdDev);

      if (Math.abs(zScore) > threshold) {
        const confidenceScore = Math.min(1, Math.abs(zScore) / 5);
        anomalies.push({
          id: `amount-outlier-${tx.id}`,
          transaction: tx,
          type: 'amount_outlier',
          severity: Math.abs(zScore) > 4 ? 'high' : Math.abs(zScore) > 3 ? 'medium' : 'low',
          description: `This $${tx.amount.toFixed(2)} deposit is ${zScore > 0 ? 'higher' : 'lower'} than your typical income (avg: $${incomeMean.toFixed(2)}).`,
          confidence: confidenceScore,
        });
      }
    }
  }

  return anomalies;
}

/**
 * Detect frequency spikes (too many transactions in short period)
 */
function detectFrequencySpikes(transactions: Transaction[], today: Date): Anomaly[] {
  const anomalies: Anomaly[] = [];

  // Group by merchant
  const merchantTransactions = new Map<string, Transaction[]>();
  for (const tx of transactions) {
    const txs = merchantTransactions.get(tx.merchant) || [];
    txs.push(tx);
    merchantTransactions.set(tx.merchant, txs);
  }

  // Check for frequency spikes
  for (const [merchant, txs] of merchantTransactions.entries()) {
    if (txs.length < 3) continue;

    // Sort by date
    const sorted = txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Check recent transactions (last 7 days)
    const recentTxs = sorted.filter((tx) => differenceInDays(today, new Date(tx.date)) <= 7);

    if (recentTxs.length >= 3) {
      // Calculate historical frequency
      const oldestDate = new Date(sorted[sorted.length - 1].date);
      const daySpan = Math.max(1, differenceInDays(today, oldestDate));
      const avgFrequency = sorted.length / daySpan;
      const recentFrequency = recentTxs.length / 7;

      // Flag if recent frequency is 3x historical average
      if (recentFrequency > avgFrequency * 3 && avgFrequency > 0) {
        anomalies.push({
          id: `frequency-spike-${merchant.toLowerCase().replace(/\s+/g, '-')}`,
          transaction: recentTxs[0],
          type: 'frequency_spike',
          severity: recentFrequency > avgFrequency * 5 ? 'high' : 'medium',
          description: `${recentTxs.length} transactions at ${merchant} in the last week is unusually high (avg: ${(avgFrequency * 7).toFixed(1)}/week).`,
          confidence: Math.min(1, recentFrequency / (avgFrequency * 3)),
        });
      }
    }
  }

  return anomalies;
}

/**
 * Detect new merchants (first-time transactions)
 */
function detectNewMerchants(transactions: Transaction[], lookbackDays = 60): Anomaly[] {
  const anomalies: Anomaly[] = [];

  // Sort transactions by date
  const sorted = transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sorted.length === 0) return anomalies;

  const today = new Date(sorted[0].date);
  const merchantFirstSeen = new Map<string, Date>();

  // Build merchant history
  for (const tx of sorted.slice().reverse()) {
    if (!merchantFirstSeen.has(tx.merchant)) {
      merchantFirstSeen.set(tx.merchant, new Date(tx.date));
    }
  }

  // Check for new merchants in recent period
  for (const tx of sorted) {
    const firstSeen = merchantFirstSeen.get(tx.merchant);
    if (!firstSeen) continue;

    const daysSinceFirst = differenceInDays(today, firstSeen);
    const daysAgo = differenceInDays(today, new Date(tx.date));

    // New merchant in last 30 days with significant amount
    if (daysSinceFirst <= 30 && daysAgo <= 30 && Math.abs(tx.amount) > 50) {
      anomalies.push({
        id: `new-merchant-${tx.id}`,
        transaction: tx,
        type: 'new_merchant',
        severity: Math.abs(tx.amount) > 200 ? 'medium' : 'low',
        description: `First transaction with ${tx.merchant} ($${Math.abs(tx.amount).toFixed(2)}).`,
        confidence: 0.9,
      });
    }
  }

  return anomalies;
}

/**
 * Detect potential duplicate transactions
 */
function detectDuplicates(transactions: Transaction[]): Anomaly[] {
  const anomalies: Anomaly[] = [];

  for (let i = 0; i < transactions.length; i += 1) {
    for (let j = i + 1; j < transactions.length; j += 1) {
      const tx1 = transactions[i];
      const tx2 = transactions[j];

      // Same merchant, same amount, within 24 hours
      if (
        tx1.merchant === tx2.merchant &&
        Math.abs(tx1.amount - tx2.amount) < 0.01 &&
        Math.abs(differenceInDays(new Date(tx1.date), new Date(tx2.date))) <= 1
      ) {
        anomalies.push({
          id: `duplicate-${tx1.id}-${tx2.id}`,
          transaction: tx1,
          type: 'duplicate_suspect',
          severity: 'medium',
          description: `Potential duplicate: Two identical $${Math.abs(tx1.amount).toFixed(2)} charges from ${tx1.merchant} within 24 hours.`,
          confidence: 0.8,
        });
        break; // Only flag once per transaction
      }
    }
  }

  return anomalies;
}

/**
 * Detect unusual transaction times (if time data available)
 */
function detectTimeAnomalies(transactions: Transaction[]): Anomaly[] {
  const anomalies: Anomaly[] = [];

  // Group by merchant to establish typical transaction patterns
  const merchantHours = new Map<string, number[]>();

  for (const tx of transactions) {
    const date = new Date(tx.date);
    const hour = date.getHours();

    const hours = merchantHours.get(tx.merchant) || [];
    hours.push(hour);
    merchantHours.set(tx.merchant, hours);
  }

  // Check for unusual times
  for (const tx of transactions) {
    const hours = merchantHours.get(tx.merchant);
    if (!hours || hours.length < 3) continue;

    const txHour = new Date(tx.date).getHours();
    const avgHour = hours.reduce((sum, h) => sum + h, 0) / hours.length;
    const stdDev = Math.sqrt(
      hours.reduce((sum, h) => sum + (h - avgHour) ** 2, 0) / hours.length
    );

    // Flag if transaction is more than 3 standard deviations from typical time
    if (Math.abs(txHour - avgHour) > Math.max(3 * stdDev, 6)) {
      // 6 hour minimum threshold
      anomalies.push({
        id: `time-anomaly-${tx.id}`,
        transaction: tx,
        type: 'time_anomaly',
        severity: 'low',
        description: `Transaction at ${tx.merchant} occurred at an unusual time (${txHour}:00, typically around ${Math.round(avgHour)}:00).`,
        confidence: 0.6,
      });
    }
  }

  return anomalies;
}

/**
 * Main anomaly detection function
 */
export function detectAnomalies(transactions: Transaction[], today: Date = new Date()): Anomaly[] {
  if (transactions.length < 5) {
    return []; // Need minimum data for meaningful analysis
  }

  const allAnomalies: Anomaly[] = [
    ...detectAmountOutliers(transactions),
    ...detectFrequencySpikes(transactions, today),
    ...detectNewMerchants(transactions),
    ...detectDuplicates(transactions),
    ...detectTimeAnomalies(transactions),
  ];

  // Sort by severity and confidence
  const severityOrder = { high: 0, medium: 1, low: 2 };
  allAnomalies.sort((a, b) => {
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return b.confidence - a.confidence;
  });

  // Return top anomalies
  return allAnomalies.slice(0, 10);
}

/**
 * Get anomaly summary statistics
 */
export function getAnomalyStats(anomalies: Anomaly[]): {
  total: number;
  byType: Record<Anomaly['type'], number>;
  bySeverity: Record<Anomaly['severity'], number>;
  avgConfidence: number;
} {
  const byType: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};
  let totalConfidence = 0;

  for (const anomaly of anomalies) {
    byType[anomaly.type] = (byType[anomaly.type] || 0) + 1;
    bySeverity[anomaly.severity] = (bySeverity[anomaly.severity] || 0) + 1;
    totalConfidence += anomaly.confidence;
  }

  return {
    total: anomalies.length,
    byType: byType as Record<Anomaly['type'], number>,
    bySeverity: bySeverity as Record<Anomaly['severity'], number>,
    avgConfidence: anomalies.length > 0 ? totalConfidence / anomalies.length : 0,
  };
}
