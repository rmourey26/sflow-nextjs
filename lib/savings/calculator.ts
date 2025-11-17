import { addDays } from 'date-fns';

import type { ForecastDay, Recurrence, Transaction } from '@/types';

/**
 * Smart Savings Calculator
 * Determines safe-to-save amounts based on forecast analysis, runway, and risk tolerance
 */

export type SafeToSaveCalculation = {
  amount: number;
  confidence: number;
  reasoning: string;
  factors: {
    runwayBuffer: number;
    forecastMargin: number;
    upcomingBills: number;
    riskAdjustment: number;
  };
  recommendedDate: Date;
  maxSafeAmount: number;
};

/**
 * Calculate the safe amount to transfer to savings
 */
export function calculateSafeToSave(
  forecastDays: ForecastDay[],
  recurrences: Recurrence[],
  transactions: Transaction[],
  currentBalance: number,
  runwayDays: number,
  today: Date,
  userBuffer = 500,
  riskTolerance: 'conservative' | 'moderate' | 'aggressive' = 'moderate',
): SafeToSaveCalculation {
  // Minimum runway threshold (in days) - don't save if runway is too low
  const minRunwayDays = riskTolerance === 'conservative' ? 21 : riskTolerance === 'moderate' ? 14 : 10;

  if (runwayDays < minRunwayDays) {
    return {
      amount: 0,
      confidence: 0,
      reasoning: `Runway is ${runwayDays} days, which is below the safe threshold. Focus on building buffer first.`,
      factors: {
        runwayBuffer: 0,
        forecastMargin: 0,
        upcomingBills: 0,
        riskAdjustment: 0,
      },
      recommendedDate: today,
      maxSafeAmount: 0,
    };
  }

  // 1. Calculate P10 (conservative) balance in 14 days
  const twoWeeksOut = forecastDays.find((day) => {
    const daysAhead = Math.floor((new Date(day.date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysAhead >= 14;
  });

  if (!twoWeeksOut) {
    return {
      amount: 0,
      confidence: 0,
      reasoning: 'Insufficient forecast data to calculate safe savings amount.',
      factors: {
        runwayBuffer: 0,
        forecastMargin: 0,
        upcomingBills: 0,
        riskAdjustment: 0,
      },
      recommendedDate: today,
      maxSafeAmount: 0,
    };
  }

  const conservativeBalance = twoWeeksOut.p10Total;
  const expectedBalance = twoWeeksOut.p50Total;

  // 2. Calculate upcoming large bills (next 14 days)
  const upcomingBills = recurrences
    .filter((r) => {
      const daysUntil = Math.floor((new Date(r.nextDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil >= 0 && daysUntil <= 14 && r.amount < 0;
    })
    .reduce((sum, r) => sum + Math.abs(r.amount), 0);

  // 3. Calculate historical spending variance
  const recentTransactions = transactions.filter((tx) => {
    const daysAgo = Math.floor((today.getTime() - new Date(tx.date).getTime()) / (1000 * 60 * 60 * 24));
    return daysAgo >= 0 && daysAgo <= 30;
  });

  const dailySpending = recentTransactions
    .filter((tx) => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0) / 30;

  const unexpectedBuffer = dailySpending * 7; // One week of average spending

  // 4. Risk tolerance multiplier
  const riskMultipliers = {
    conservative: 0.5,
    moderate: 0.7,
    aggressive: 0.85,
  };
  const riskMultiplier = riskMultipliers[riskTolerance];

  // 5. Calculate safe amount
  // Amount = (Conservative balance - User buffer - Unexpected buffer) * Risk multiplier
  const baseAmount = Math.max(0, conservativeBalance - userBuffer - unexpectedBuffer - upcomingBills);
  const safeAmount = baseAmount * riskMultiplier;

  // Max safe amount is the difference between current and conservative balance
  const maxSafeAmount = Math.max(0, currentBalance - userBuffer - unexpectedBuffer);

  // 6. Find best date to transfer (right after next income)
  const nextIncome = recurrences
    .filter((r) => r.amount > 0)
    .sort((a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime())[0];

  const recommendedDate = nextIncome ? addDays(new Date(nextIncome.nextDate), 1) : addDays(today, 7);

  // 7. Calculate confidence
  let confidence = 0.5;

  // Higher confidence with more runway
  if (runwayDays > 30) confidence += 0.2;
  else if (runwayDays > 21) confidence += 0.1;

  // Higher confidence with stable spending
  if (dailySpending > 0 && unexpectedBuffer / dailySpending < 10) confidence += 0.15;

  // Higher confidence if conservative forecast is well above zero
  if (conservativeBalance > userBuffer * 2) confidence += 0.15;

  confidence = Math.min(1, confidence);

  // 8. Generate reasoning
  let reasoning = '';
  if (safeAmount > 0) {
    reasoning = `Based on your ${runwayDays}-day runway and conservative forecast, you can safely save $${Math.round(safeAmount)}. `;
    reasoning += `This keeps you above $${userBuffer} in the P10 scenario even with unexpected expenses. `;
    reasoning += `Best to transfer after your next income on ${recommendedDate.toLocaleDateString()}.`;
  } else {
    reasoning = `Currently not recommended to save due to tight cash flow. `;
    if (upcomingBills > 0) {
      reasoning += `Large bills of $${Math.round(upcomingBills)} are coming in the next two weeks. `;
    }
    reasoning += 'Focus on maintaining your buffer first.';
  }

  return {
    amount: Math.round(safeAmount),
    confidence: Math.round(confidence * 100) / 100,
    reasoning,
    factors: {
      runwayBuffer: Math.round(baseAmount),
      forecastMargin: Math.round(conservativeBalance - currentBalance),
      upcomingBills: Math.round(upcomingBills),
      riskAdjustment: Math.round((1 - riskMultiplier) * baseAmount),
    },
    recommendedDate,
    maxSafeAmount: Math.round(maxSafeAmount),
  };
}

/**
 * Calculate impact of saving an amount on runway
 */
export function calculateSavingsImpact(
  amount: number,
  forecastDays: ForecastDay[],
  currentRunway: number,
  userBuffer = 500,
): {
  newRunway: number;
  runwayChange: number;
  riskLevel: 'low' | 'medium' | 'high';
  willStayAboveBuffer: boolean;
} {
  // Find when balance would drop below buffer after savings
  let newRunway = 0;

  for (const day of forecastDays) {
    if (day.p50Total - amount < userBuffer) {
      break;
    }
    newRunway += 1;
  }

  const runwayChange = newRunway - currentRunway;
  const willStayAboveBuffer = newRunway > 14;

  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (newRunway < 7) riskLevel = 'high';
  else if (newRunway < 14) riskLevel = 'medium';

  return {
    newRunway,
    runwayChange,
    riskLevel,
    willStayAboveBuffer,
  };
}

/**
 * Suggest optimal savings schedule
 */
export function generateSavingsSchedule(
  forecastDays: ForecastDay[],
  recurrences: Recurrence[],
  transactions: Transaction[],
  currentBalance: number,
  runwayDays: number,
  today: Date,
  goalAmount: number,
  userBuffer = 500,
): Array<{
  date: Date;
  amount: number;
  confidence: number;
  cumulativeAmount: number;
}> {
  const schedule: Array<{
    date: Date;
    amount: number;
    confidence: number;
    cumulativeAmount: number;
  }> = [];

  let cumulative = 0;
  let currentDate = new Date(today);

  // Try to schedule savings after each income
  const incomes = recurrences
    .filter((r) => r.amount > 0)
    .sort((a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime())
    .slice(0, 12); // Up to 12 months

  for (const income of incomes) {
    const incomeDate = new Date(income.nextDate);
    if (incomeDate <= currentDate) continue;

    // Calculate safe amount for this date
    const calculation = calculateSafeToSave(
      forecastDays,
      recurrences,
      transactions,
      currentBalance,
      runwayDays,
      incomeDate,
      userBuffer,
      'moderate',
    );

    if (calculation.amount > 0) {
      cumulative += calculation.amount;
      schedule.push({
        date: addDays(incomeDate, 1),
        amount: calculation.amount,
        confidence: calculation.confidence,
        cumulativeAmount: cumulative,
      });

      if (cumulative >= goalAmount) {
        break; // Goal reached
      }
    }

    currentDate = incomeDate;
  }

  return schedule;
}

/**
 * Calculate emergency fund recommendation
 */
export function calculateEmergencyFundTarget(
  transactions: Transaction[],
  recurrences: Recurrence[],
): {
  recommended: number;
  minimumMonths: number;
  monthlyExpenses: number;
  reasoning: string;
} {
  // Calculate average monthly expenses from transactions
  const expenses = transactions.filter((tx) => tx.amount < 0);
  const totalExpenses = Math.abs(expenses.reduce((sum, tx) => sum + tx.amount, 0));
  const daysSpan = 30; // Approximate
  const monthlyExpenses = (totalExpenses / daysSpan) * 30;

  // Add recurring expenses
  const monthlyRecurring = recurrences
    .filter((r) => r.amount < 0)
    .reduce((sum, r) => {
      const cadenceMultiplier = {
        weekly: 4.33,
        biweekly: 2.17,
        monthly: 1,
        quarterly: 0.33,
        yearly: 0.083,
      };
      return sum + Math.abs(r.amount) * cadenceMultiplier[r.cadence];
    }, 0);

  const totalMonthlyExpenses = monthlyExpenses + monthlyRecurring;

  // Recommend 3-6 months based on income stability
  const incomes = recurrences.filter((r) => r.amount > 0);
  const hasStableIncome = incomes.some((r) => r.confidence === 'high' && r.cadence === 'monthly');

  const minimumMonths = hasStableIncome ? 3 : 6;
  const recommended = totalMonthlyExpenses * minimumMonths;

  const reasoning = hasStableIncome
    ? `With stable monthly income, aim for ${minimumMonths} months of expenses ($${Math.round(totalMonthlyExpenses)}/month).`
    : `Without consistent income, aim for ${minimumMonths} months of expenses ($${Math.round(totalMonthlyExpenses)}/month) for better security.`;

  return {
    recommended: Math.round(recommended),
    minimumMonths,
    monthlyExpenses: Math.round(totalMonthlyExpenses),
    reasoning,
  };
}
