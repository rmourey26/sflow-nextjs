import { addDays, differenceInDays } from 'date-fns';

import type { ForecastDay } from '@/types';

/**
 * Precise Runway Calculator with Buffer Zones and Confidence Intervals
 * Calculates how many days of financial runway remain based on forecast data
 */

export type RunwayCalculation = {
  days: number;
  exhaustionDate: Date | null;
  confidence: number;
  scenarios: {
    optimistic: { days: number; exhaustionDate: Date | null }; // P90
    expected: { days: number; exhaustionDate: Date | null }; // P50
    conservative: { days: number; exhaustionDate: Date | null }; // P10
  };
  bufferZones: {
    safe: boolean; // > 30 days
    caution: boolean; // 14-30 days
    critical: boolean; // < 14 days
  };
  trend: 'extending' | 'stable' | 'shrinking';
  recommendation: string;
};

/**
 * Calculate days until balance drops below threshold
 */
function calculateDaysAboveThreshold(
  forecastDays: ForecastDay[],
  threshold: number,
  metric: 'p10Total' | 'p50Total' | 'p90Total' = 'p50Total',
): number {
  let days = 0;

  for (const day of forecastDays) {
    if (day[metric] < threshold) {
      break;
    }
    days += 1;
  }

  return days;
}

/**
 * Calculate runway with detailed scenarios
 */
export function calculateRunway(
  forecastDays: ForecastDay[],
  buffer: number = 500,
  today: Date = new Date(),
): RunwayCalculation {
  if (forecastDays.length === 0) {
    return {
      days: 0,
      exhaustionDate: null,
      confidence: 0,
      scenarios: {
        optimistic: { days: 0, exhaustionDate: null },
        expected: { days: 0, exhaustionDate: null },
        conservative: { days: 0, exhaustionDate: null },
      },
      bufferZones: {
        safe: false,
        caution: false,
        critical: true,
      },
      trend: 'stable',
      recommendation: 'Unable to calculate runway - no forecast data available.',
    };
  }

  // Calculate for each scenario
  const conservativeDays = calculateDaysAboveThreshold(forecastDays, buffer, 'p10Total');
  const expectedDays = calculateDaysAboveThreshold(forecastDays, buffer, 'p50Total');
  const optimisticDays = calculateDaysAboveThreshold(forecastDays, buffer, 'p90Total');

  // Primary runway is based on P50 (expected scenario)
  const runwayDays = expectedDays;

  const exhaustionDate = runwayDays < forecastDays.length ? addDays(today, runwayDays) : null;
  const conservativeExhaustion = conservativeDays < forecastDays.length ? addDays(today, conservativeDays) : null;
  const optimisticExhaustion = optimisticDays < forecastDays.length ? addDays(today, optimisticDays) : null;

  // Determine buffer zones
  const bufferZones = {
    safe: runwayDays > 30,
    caution: runwayDays >= 14 && runwayDays <= 30,
    critical: runwayDays < 14,
  };

  // Calculate confidence based on band width
  const avgBandWidth =
    forecastDays.slice(0, Math.min(30, forecastDays.length)).reduce(
      (sum, day) => sum + (day.p90Total - day.p10Total),
      0,
    ) / Math.min(30, forecastDays.length);

  const avgBalance =
    forecastDays.slice(0, Math.min(30, forecastDays.length)).reduce((sum, day) => sum + day.p50Total, 0) /
    Math.min(30, forecastDays.length);

  const bandRatio = Math.abs(avgBalance) > 0 ? avgBandWidth / Math.abs(avgBalance) : 1;
  const confidence = Math.max(0.3, Math.min(1, 1 - bandRatio * 0.5));

  // Analyze trend
  let trend: 'extending' | 'stable' | 'shrinking' = 'stable';

  if (forecastDays.length >= 7) {
    const firstWeekAvg =
      forecastDays.slice(0, 7).reduce((sum, day) => sum + day.p50Total, 0) / 7;
    const lastWeekStart = Math.max(0, Math.min(14, forecastDays.length - 7));
    const lastWeekEnd = Math.min(forecastDays.length, lastWeekStart + 7);
    const lastWeekAvg =
      forecastDays.slice(lastWeekStart, lastWeekEnd).reduce((sum, day) => sum + day.p50Total, 0) /
      (lastWeekEnd - lastWeekStart);

    if (lastWeekAvg > firstWeekAvg * 1.1) trend = 'extending';
    else if (lastWeekAvg < firstWeekAvg * 0.9) trend = 'shrinking';
  }

  // Generate recommendation
  let recommendation = '';
  if (bufferZones.critical) {
    recommendation = `Critical: Only ${runwayDays} days of runway. Immediate action needed - reduce expenses or secure additional income.`;
  } else if (bufferZones.caution) {
    recommendation = `Caution: ${runwayDays} days of runway. Review upcoming expenses and consider postponing non-essential spending.`;
  } else {
    recommendation = `Good: ${runwayDays} days of runway. `;
    if (trend === 'extending') {
      recommendation += 'Runway is improving - consider allocating to savings goals.';
    } else if (trend === 'shrinking') {
      recommendation += 'Runway is declining - monitor closely and adjust spending if needed.';
    } else {
      recommendation += 'Maintain current course and continue building buffer.';
    }
  }

  return {
    days: runwayDays,
    exhaustionDate,
    confidence: Math.round(confidence * 100) / 100,
    scenarios: {
      optimistic: {
        days: optimisticDays,
        exhaustionDate: optimisticExhaustion,
      },
      expected: {
        days: expectedDays,
        exhaustionDate,
      },
      conservative: {
        days: conservativeDays,
        exhaustionDate: conservativeExhaustion,
      },
    },
    bufferZones,
    trend,
    recommendation,
  };
}

/**
 * Calculate runway change from an action (e.g., savings transfer, expense)
 */
export function calculateRunwayImpact(
  forecastDays: ForecastDay[],
  amount: number,
  buffer: number = 500,
  today: Date = new Date(),
): {
  currentRunway: number;
  newRunway: number;
  change: number;
  percentChange: number;
  newExhaustionDate: Date | null;
} {
  // Current runway
  const current = calculateRunway(forecastDays, buffer, today);

  // Simulate adjusted forecast
  const adjustedForecast = forecastDays.map((day) => ({
    ...day,
    p50Total: day.p50Total - amount,
    p10Total: day.p10Total - amount,
    p90Total: day.p90Total - amount,
  }));

  // New runway
  const adjusted = calculateRunway(adjustedForecast, buffer, today);

  const change = adjusted.days - current.days;
  const percentChange = current.days > 0 ? (change / current.days) * 100 : 0;

  return {
    currentRunway: current.days,
    newRunway: adjusted.days,
    change,
    percentChange: Math.round(percentChange),
    newExhaustionDate: adjusted.exhaustionDate,
  };
}

/**
 * Get runway milestones (important thresholds)
 */
export function getRunwayMilestones(runwayDays: number): Array<{
  threshold: number;
  label: string;
  achieved: boolean;
  daysToGo: number;
}> {
  const milestones = [
    { threshold: 7, label: 'One week buffer' },
    { threshold: 14, label: 'Two weeks buffer' },
    { threshold: 30, label: 'One month buffer' },
    { threshold: 60, label: 'Two months buffer' },
    { threshold: 90, label: 'Three months buffer' },
  ];

  return milestones.map((milestone) => ({
    ...milestone,
    achieved: runwayDays >= milestone.threshold,
    daysToGo: Math.max(0, milestone.threshold - runwayDays),
  }));
}

/**
 * Analyze runway volatility
 */
export function analyzeRunwayVolatility(
  forecastDays: ForecastDay[],
  buffer: number = 500,
): {
  volatility: 'low' | 'medium' | 'high';
  score: number;
  description: string;
} {
  if (forecastDays.length < 7) {
    return {
      volatility: 'medium',
      score: 50,
      description: 'Insufficient data to assess volatility.',
    };
  }

  // Calculate daily runway changes
  const dailyRunways: number[] = [];
  for (let i = 0; i < Math.min(30, forecastDays.length); i += 1) {
    const slicedForecast = forecastDays.slice(i);
    const days = calculateDaysAboveThreshold(slicedForecast, buffer, 'p50Total');
    dailyRunways.push(days);
  }

  // Calculate variance
  const mean = dailyRunways.reduce((sum, val) => sum + val, 0) / dailyRunways.length;
  const variance =
    dailyRunways.reduce((sum, val) => sum + (val - mean) ** 2, 0) / dailyRunways.length;
  const stdDev = Math.sqrt(variance);

  const coefficientOfVariation = mean > 0 ? stdDev / mean : 0;

  // Classify volatility
  let volatility: 'low' | 'medium' | 'high' = 'medium';
  let score = coefficientOfVariation * 100;

  if (coefficientOfVariation < 0.1) {
    volatility = 'low';
    score = 25;
  } else if (coefficientOfVariation < 0.25) {
    volatility = 'medium';
    score = 50;
  } else {
    volatility = 'high';
    score = 80;
  }

  const descriptions = {
    low: 'Runway is stable and predictable. Low financial volatility.',
    medium: 'Runway shows moderate fluctuations. Monitor for significant changes.',
    high: 'Runway is highly variable. Cash flow is unpredictable - consider building larger buffer.',
  };

  return {
    volatility,
    score: Math.round(score),
    description: descriptions[volatility],
  };
}

/**
 * Calculate time to reach runway goal
 */
export function calculateTimeToRunwayGoal(
  forecastDays: ForecastDay[],
  currentRunway: number,
  targetRunway: number,
  buffer: number = 500,
): {
  achievable: boolean;
  daysNeeded: number | null;
  averageImprovement: number;
  message: string;
} {
  if (currentRunway >= targetRunway) {
    return {
      achievable: true,
      daysNeeded: 0,
      averageImprovement: 0,
      message: 'Target already achieved!',
    };
  }

  // Analyze trend
  if (forecastDays.length < 14) {
    return {
      achievable: false,
      daysNeeded: null,
      averageImprovement: 0,
      message: 'Insufficient data to project timeline.',
    };
  }

  // Calculate daily improvement rate
  const firstWeekRunway = calculateDaysAboveThreshold(forecastDays, buffer, 'p50Total');
  const secondWeekForecast = forecastDays.slice(7);
  const secondWeekRunway = calculateDaysAboveThreshold(secondWeekForecast, buffer, 'p50Total');

  const weeklyChange = secondWeekRunway - firstWeekRunway + 7; // +7 because we moved forward 7 days
  const averageImprovement = weeklyChange / 7;

  if (averageImprovement <= 0) {
    return {
      achievable: false,
      daysNeeded: null,
      averageImprovement,
      message: 'Runway is not improving at current trajectory. Increase income or reduce expenses to reach goal.',
    };
  }

  const daysNeeded = Math.ceil((targetRunway - currentRunway) / averageImprovement);

  return {
    achievable: true,
    daysNeeded,
    averageImprovement: Math.round(averageImprovement * 100) / 100,
    message: `At current rate, you'll reach ${targetRunway} days of runway in approximately ${daysNeeded} days.`,
  };
}
