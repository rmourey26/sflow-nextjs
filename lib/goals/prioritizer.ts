import { differenceInDays } from 'date-fns';

/**
 * Goal Prioritization Algorithm
 * Intelligently ranks savings goals based on urgency, financial health, and user needs
 */

export type SavingsGoal = {
  id: string;
  name: string;
  target: number;
  saved: number;
  deadline?: Date;
  priority: 'essential' | 'important' | 'aspirational';
  category: 'emergency' | 'large_purchase' | 'debt' | 'investment' | 'lifestyle' | 'other';
};

export type PrioritizedGoal = SavingsGoal & {
  score: number;
  rank: number;
  reasoning: string;
  urgencyScore: number;
  impactScore: number;
  feasibilityScore: number;
  recommendedMonthlyContribution: number;
};

type PrioritizationInput = {
  goals: SavingsGoal[];
  runwayDays: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  currentEmergencyFund: number;
  safeToSaveAmount: number;
};

/**
 * Calculate urgency score (0-100)
 */
function calculateUrgencyScore(goal: SavingsGoal, today: Date): number {
  let score = 0;

  // Priority weight
  const priorityScores = {
    essential: 40,
    important: 25,
    aspirational: 10,
  };
  score += priorityScores[goal.priority];

  // Deadline weight
  if (goal.deadline) {
    const daysUntilDeadline = differenceInDays(goal.deadline, today);
    if (daysUntilDeadline < 30) score += 30;
    else if (daysUntilDeadline < 90) score += 20;
    else if (daysUntilDeadline < 180) score += 10;
    else score += 5;
  } else {
    score += 5; // No deadline = low urgency
  }

  // Category urgency
  const categoryUrgency = {
    emergency: 30,
    debt: 25,
    large_purchase: 15,
    investment: 10,
    lifestyle: 5,
    other: 5,
  };
  score += categoryUrgency[goal.category];

  return Math.min(100, score);
}

/**
 * Calculate impact score (0-100)
 */
function calculateImpactScore(
  goal: SavingsGoal,
  runwayDays: number,
  currentEmergencyFund: number,
  monthlyExpenses: number,
): number {
  let score = 0;

  // Emergency fund has highest impact if runway is low
  if (goal.category === 'emergency') {
    if (runwayDays < 14) score += 50;
    else if (runwayDays < 30) score += 35;
    else if (runwayDays < 60) score += 20;
    else score += 10;

    // Additional points if emergency fund is insufficient
    const monthsOfExpenses = monthlyExpenses > 0 ? currentEmergencyFund / monthlyExpenses : 0;
    if (monthsOfExpenses < 3) score += 30;
    else if (monthsOfExpenses < 6) score += 15;
  }

  // Debt reduction has high impact
  if (goal.category === 'debt') {
    score += 40;
  }

  // Large purchases and investments have moderate impact
  if (goal.category === 'large_purchase' || goal.category === 'investment') {
    score += 20;
  }

  // Lifestyle goals have lower impact
  if (goal.category === 'lifestyle') {
    score += 10;
  }

  // Progress bonus - goals close to completion have higher impact
  const progress = goal.target > 0 ? goal.saved / goal.target : 0;
  if (progress > 0.75) score += 20;
  else if (progress > 0.5) score += 10;
  else if (progress > 0.25) score += 5;

  return Math.min(100, score);
}

/**
 * Calculate feasibility score (0-100)
 */
function calculateFeasibilityScore(
  goal: SavingsGoal,
  safeToSaveAmount: number,
  monthlyIncome: number,
  today: Date,
): number {
  let score = 50; // Base score

  const remaining = goal.target - goal.saved;

  // How many months would it take at current safe-to-save rate?
  const monthsToComplete = safeToSaveAmount > 0 ? remaining / safeToSaveAmount : Infinity;

  if (monthsToComplete < 3) score += 30;
  else if (monthsToComplete < 6) score += 20;
  else if (monthsToComplete < 12) score += 10;
  else if (monthsToComplete < 24) score += 5;
  else score -= 10; // Very long-term goals are less feasible

  // Check against deadline
  if (goal.deadline) {
    const monthsUntilDeadline = Math.max(1, differenceInDays(goal.deadline, today) / 30);
    const requiredMonthlySave = remaining / monthsUntilDeadline;

    if (requiredMonthlySave <= safeToSaveAmount) score += 20; // Definitely feasible
    else if (requiredMonthlySave <= safeToSaveAmount * 1.5) score += 5; // Tight but doable
    else score -= 20; // Not feasible at current rate
  }

  // Smaller goals are more feasible
  if (remaining < 500) score += 15;
  else if (remaining < 1000) score += 10;
  else if (remaining < 5000) score += 5;

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate recommended monthly contribution
 */
function calculateRecommendedContribution(
  goal: SavingsGoal,
  safeToSaveAmount: number,
  today: Date,
  totalGoalsRemaining: number,
): number {
  const remaining = goal.target - goal.saved;

  if (remaining <= 0) return 0;

  // If there's a deadline, calculate based on that
  if (goal.deadline) {
    const monthsUntilDeadline = Math.max(1, differenceInDays(goal.deadline, today) / 30);
    const requiredMonthly = remaining / monthsUntilDeadline;

    // Don't exceed what's safely available
    return Math.min(requiredMonthly, safeToSaveAmount);
  }

  // For essential/important goals, allocate more of the safe amount
  const allocationRatio = {
    essential: 0.6,
    important: 0.4,
    aspirational: 0.2,
  };

  const baseAllocation = safeToSaveAmount * allocationRatio[goal.priority];

  // Adjust for number of goals (don't spread too thin)
  const adjustedAllocation = totalGoalsRemaining > 1 ? baseAllocation / Math.sqrt(totalGoalsRemaining) : baseAllocation;

  // Ensure we can complete in reasonable time (within 2 years)
  const maxMonths = 24;
  const minRequired = remaining / maxMonths;

  return Math.max(minRequired, Math.round(adjustedAllocation));
}

/**
 * Prioritize multiple goals
 */
export function prioritizeGoals(input: PrioritizationInput): PrioritizedGoal[] {
  const { goals, runwayDays, monthlyIncome, monthlyExpenses, currentEmergencyFund, safeToSaveAmount } = input;

  const today = new Date();
  const totalRemaining = goals.reduce((sum, g) => sum + Math.max(0, g.target - g.saved), 0);

  // Calculate scores for each goal
  const scoredGoals: Array<PrioritizedGoal> = goals.map((goal) => {
    const urgencyScore = calculateUrgencyScore(goal, today);
    const impactScore = calculateImpactScore(goal, runwayDays, currentEmergencyFund, monthlyExpenses);
    const feasibilityScore = calculateFeasibilityScore(goal, safeToSaveAmount, monthlyIncome, today);

    // Weighted overall score
    const score = urgencyScore * 0.35 + impactScore * 0.4 + feasibilityScore * 0.25;

    const recommendedMonthlyContribution = calculateRecommendedContribution(
      goal,
      safeToSaveAmount,
      today,
      goals.filter((g) => g.target > g.saved).length,
    );

    // Generate reasoning
    let reasoning = '';
    if (goal.category === 'emergency' && runwayDays < 30) {
      reasoning = 'Critical priority: Building emergency fund will provide essential financial security.';
    } else if (goal.priority === 'essential') {
      reasoning = 'Essential goal with significant impact on your financial well-being.';
    } else if (goal.deadline) {
      const daysLeft = differenceInDays(goal.deadline, today);
      reasoning = `Deadline in ${Math.round(daysLeft / 30)} months requires consistent contributions.`;
    } else if (feasibilityScore > 70) {
      reasoning = 'Highly achievable at your current savings rate.';
    } else {
      reasoning = 'Long-term goal that requires sustained effort.';
    }

    return {
      ...goal,
      score: Math.round(score),
      rank: 0, // Will be assigned after sorting
      reasoning,
      urgencyScore: Math.round(urgencyScore),
      impactScore: Math.round(impactScore),
      feasibilityScore: Math.round(feasibilityScore),
      recommendedMonthlyContribution: Math.round(recommendedMonthlyContribution),
    };
  });

  // Sort by score and assign ranks
  scoredGoals.sort((a, b) => b.score - a.score);
  scoredGoals.forEach((goal, index) => {
    goal.rank = index + 1;
  });

  return scoredGoals;
}

/**
 * Get goal allocation recommendation
 */
export function getGoalAllocationStrategy(
  prioritizedGoals: PrioritizedGoal[],
  availableAmount: number,
): Array<{
  goalId: string;
  goalName: string;
  allocation: number;
  reasoning: string;
}> {
  const allocations: Array<{
    goalId: string;
    goalName: string;
    allocation: number;
    reasoning: string;
  }> = [];

  let remaining = availableAmount;

  // Allocate based on rank and need
  for (const goal of prioritizedGoals) {
    if (remaining <= 0) break;

    const goalRemaining = goal.target - goal.saved;
    if (goalRemaining <= 0) continue;

    // Allocate based on priority and remaining amount
    let allocation = 0;

    if (goal.rank === 1 && goal.priority === 'essential') {
      // Top essential goal gets up to 60% of available
      allocation = Math.min(goalRemaining, remaining * 0.6);
    } else if (goal.rank <= 2) {
      // Top 2 goals share more
      allocation = Math.min(goalRemaining, remaining * 0.3);
    } else {
      // Lower priority goals get smaller allocations
      allocation = Math.min(goalRemaining, remaining * 0.15);
    }

    // Ensure minimum viable allocation (at least $5)
    if (allocation < 5 && goalRemaining >= 5) {
      allocation = Math.min(5, remaining, goalRemaining);
    }

    if (allocation > 0) {
      allocations.push({
        goalId: goal.id,
        goalName: goal.name,
        allocation: Math.round(allocation),
        reasoning: `Rank #${goal.rank} - ${goal.reasoning}`,
      });

      remaining -= allocation;
    }
  }

  return allocations;
}

/**
 * Check if goal is on track
 */
export function isGoalOnTrack(goal: SavingsGoal, currentContributionRate: number, today: Date): {
  onTrack: boolean;
  status: 'ahead' | 'on_track' | 'behind' | 'no_deadline';
  daysAhead: number;
  message: string;
} {
  if (!goal.deadline) {
    return {
      onTrack: true,
      status: 'no_deadline',
      daysAhead: 0,
      message: 'No deadline set - progress at your own pace.',
    };
  }

  const remaining = goal.target - goal.saved;
  const daysUntilDeadline = differenceInDays(goal.deadline, today);

  if (daysUntilDeadline <= 0) {
    return {
      onTrack: false,
      status: 'behind',
      daysAhead: daysUntilDeadline,
      message: 'Deadline has passed.',
    };
  }

  const requiredMonthlyRate = remaining / (daysUntilDeadline / 30);
  const projectedCompletion = currentContributionRate > 0 ? remaining / currentContributionRate : Infinity;

  if (projectedCompletion < daysUntilDeadline / 30) {
    const monthsAhead = (daysUntilDeadline / 30) - projectedCompletion;
    return {
      onTrack: true,
      status: 'ahead',
      daysAhead: Math.round(monthsAhead * 30),
      message: `Ahead of schedule! You're on track to finish ${Math.round(monthsAhead)} months early.`,
    };
  } else if (projectedCompletion <= (daysUntilDeadline / 30) * 1.1) {
    return {
      onTrack: true,
      status: 'on_track',
      daysAhead: 0,
      message: 'Right on track to meet your deadline.',
    };
  } else {
    const increaseNeeded = requiredMonthlyRate - currentContributionRate;
    return {
      onTrack: false,
      status: 'behind',
      daysAhead: Math.round(projectedCompletion * 30 - daysUntilDeadline),
      message: `Behind schedule. Increase contributions by $${Math.round(increaseNeeded)}/month to stay on track.`,
    };
  }
}
