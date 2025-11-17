/**
 * Advanced Features Module
 * Central export point for all advanced financial analysis features
 */

// Forecast Engine
export {
  generateAdvancedForecast,
  calculateForecastConfidence,
} from '../forecast/engine';

// Risk Detection
export {
  detectRisks,
  calculateRiskScore,
} from '../risk/detector';

// Transaction Categorization
export {
  categorizeTransaction,
  categorizeTransactions,
  analyzeSpendingByCategory,
  getTopSpendingCategories,
  identifyIrregularMerchants,
} from '../categorization/classifier';
export type { TransactionCategory } from '../categorization/classifier';

// Anomaly Detection
export {
  detectAnomalies,
  getAnomalyStats,
} from '../anomaly/detector';
export type { Anomaly } from '../anomaly/detector';

// Cash Flow Analysis
export {
  analyzeCashFlow,
  analyzeTrend,
  calculateBurnRate,
  identifyRecurringPatterns,
  generateWeeklySummaries,
} from '../cashflow/analyzer';
export type { CashFlowSummary, TrendAnalysis } from '../cashflow/analyzer';

// Smart Savings Calculator
export {
  calculateSafeToSave,
  calculateSavingsImpact,
  generateSavingsSchedule,
  calculateEmergencyFundTarget,
} from '../savings/calculator';
export type { SafeToSaveCalculation } from '../savings/calculator';

// Goal Prioritization
export {
  prioritizeGoals,
  getGoalAllocationStrategy,
  isGoalOnTrack,
} from '../goals/prioritizer';
export type { SavingsGoal, PrioritizedGoal } from '../goals/prioritizer';

// Runway Calculator
export {
  calculateRunway,
  calculateRunwayImpact,
  getRunwayMilestones,
  analyzeRunwayVolatility,
  calculateTimeToRunwayGoal,
} from '../runway/calculator';
export type { RunwayCalculation } from '../runway/calculator';

// Forecast Adapter
export {
  fetchForecast,
  enhanceWithAdvancedFeatures,
  calculateWhatIfScenario,
} from '../forecast/adapter';
