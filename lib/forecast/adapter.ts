import { apiRequest } from '@/lib/api/client';
import { log } from '@/lib/logger';
import { generateMockFlowState } from '@/lib/mockData';
import { generateAdvancedForecast, calculateForecastConfidence } from '@/lib/forecast/engine';
import { detectRisks } from '@/lib/risk/detector';
import { calculateRunway } from '@/lib/runway/calculator';
import { calculateSafeToSave } from '@/lib/savings/calculator';
import { categorizeTransactions } from '@/lib/categorization/classifier';
import type { FlowState } from '@/types';

type ForecastRequestPayload = {
  today: string;
  timezone: string;
  mode: 'connected' | 'manual';
  accounts?: FlowState['accounts'];
  transactions?: FlowState['transactions'];
  recurrences?: FlowState['recurrences'];
  whatIf?: Record<string, unknown>;
};

type ForecastOptions = {
  manual?: boolean;
  mockSeed?: string;
  mockIncome?: number;
  mockBuffer?: number;
  signal?: AbortSignal;
  useAdvancedEngine?: boolean;
};

/**
 * Fetch forecast with advanced calculation engine
 */
export async function fetchForecast(options: ForecastOptions = {}): Promise<FlowState> {
  const now = new Date();
  const payload: ForecastRequestPayload = {
    today: now.toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    mode: options.manual ? 'manual' : 'connected',
  };

  try {
    const response = await apiRequest<FlowState>({
      path: '/api/forecast',
      method: 'POST',
      data: payload,
      headers: options.manual ? { 'x-saverflow-mode': 'manual' } : undefined,
    });
    
    // Enhance with advanced features if enabled
    if (options.useAdvancedEngine) {
      return enhanceWithAdvancedFeatures(response);
    }
    
    return response;
  } catch (error) {
    log('warn', 'Falling back to local forecast mock', { error });
    const mockData = generateMockFlowState({
      seed: options.mockSeed,
      monthlyIncome: options.mockIncome,
      buffer: options.mockBuffer,
    });
    
    // Always use advanced engine for local data
    return enhanceWithAdvancedFeatures(mockData);
  }
}

/**
 * Enhance flow state with advanced calculation features
 */
export function enhanceWithAdvancedFeatures(flowState: FlowState): FlowState {
  const today = new Date(flowState.today);
  const currentBalance = flowState.accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);

  // 1. Categorize transactions
  const categorizedTransactions = categorizeTransactions(flowState.transactions);

  // 2. Generate advanced forecast with Monte Carlo simulation
  const forecastDays = generateAdvancedForecast({
    today,
    accounts: flowState.accounts,
    transactions: categorizedTransactions,
    recurrences: flowState.recurrences,
    buffer: flowState.userBuffer,
    horizonDays: 90,
    simulations: 500, // Balance between accuracy and performance
  });

  // 3. Calculate precise runway
  const runwayCalculation = calculateRunway(forecastDays, flowState.userBuffer, today);

  // 4. Calculate forecast confidence
  const confidence = calculateForecastConfidence(
    categorizedTransactions,
    flowState.recurrences,
    forecastDays,
  );

  // 5. Detect risks automatically
  const risks = detectRisks({
    today,
    forecastDays,
    transactions: categorizedTransactions,
    recurrences: flowState.recurrences,
    runwayDays: runwayCalculation.days,
    currentBalance,
  });

  // 6. Calculate smart savings suggestion
  const safeToSave = calculateSafeToSave(
    forecastDays,
    flowState.recurrences,
    categorizedTransactions,
    currentBalance,
    runwayCalculation.days,
    today,
    flowState.userBuffer,
    'moderate',
  );

  // 7. Generate enhanced suggestion
  const enhancedSuggestion = safeToSave.amount > 0
    ? {
        id: `suggestion-smart-save-${Date.now()}`,
        title: `Move $${safeToSave.amount} to savings`,
        action: 'transfer',
        transferAmount: safeToSave.amount,
        date: safeToSave.recommendedDate.toISOString(),
        expectedRunwayChangeDays: Math.abs(runwayCalculation.scenarios.expected.days - runwayCalculation.scenarios.conservative.days),
        rationale: safeToSave.reasoning,
        status: 'pending' as const,
      }
    : flowState.suggestion;

  return {
    ...flowState,
    transactions: categorizedTransactions,
    forecastDays,
    runwayDays: runwayCalculation.days,
    confidence,
    risks,
    suggestion: enhancedSuggestion,
  };
}

/**
 * Calculate what-if scenario
 */
export function calculateWhatIfScenario(
  baseFlow: FlowState,
  scenarioType: 'delay_bill' | 'cancel_subscription' | 'add_expense' | 'add_income',
  amount: number,
  date?: Date,
): FlowState {
  const today = new Date(baseFlow.today);
  const targetDate = date || new Date();

  // Adjust recurrences or add one-time transaction based on scenario
  let adjustedRecurrences = [...baseFlow.recurrences];
  let adjustedTransactions = [...baseFlow.transactions];

  switch (scenarioType) {
    case 'delay_bill': {
      // Find next large bill and delay it
      const largeBill = adjustedRecurrences
        .filter((r) => r.amount < 0)
        .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))[0];
      
      if (largeBill) {
        adjustedRecurrences = adjustedRecurrences.map((r) =>
          r.name === largeBill.name
            ? { ...r, nextDate: new Date(new Date(r.nextDate).getTime() + 5 * 24 * 60 * 60 * 1000).toISOString() }
            : r
        );
      }
      break;
    }

    case 'cancel_subscription': {
      // Remove a recurring subscription
      const subscription = adjustedRecurrences.find((r) => r.amount < 0 && r.cadence === 'monthly');
      if (subscription) {
        adjustedRecurrences = adjustedRecurrences.filter((r) => r.name !== subscription.name);
      }
      break;
    }

    case 'add_expense': {
      // Add one-time expense
      adjustedTransactions = [
        ...adjustedTransactions,
        {
          id: `temp-expense-${Date.now()}`,
          accountId: baseFlow.accounts[0].id,
          date: targetDate.toISOString(),
          amount: -Math.abs(amount),
          merchant: 'One-time purchase',
          category: 'shopping',
        },
      ];
      break;
    }

    case 'add_income': {
      // Add one-time income
      adjustedTransactions = [
        ...adjustedTransactions,
        {
          id: `temp-income-${Date.now()}`,
          accountId: baseFlow.accounts[0].id,
          date: targetDate.toISOString(),
          amount: Math.abs(amount),
          merchant: 'Additional income',
          category: 'income',
        },
      ];
      break;
    }
  }

  const adjustedFlow = {
    ...baseFlow,
    recurrences: adjustedRecurrences,
    transactions: adjustedTransactions,
  };

  return enhanceWithAdvancedFeatures(adjustedFlow);
}
