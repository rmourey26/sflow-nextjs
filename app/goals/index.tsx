import { useMemo, useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Section } from '@/components/Section';
import { useAnalytics } from '@/lib/analytics/provider';
import { useFlowStore } from '@/store/useFlowStore';
import { calculateSafeToSave, prioritizeGoals } from '@/lib/advanced';
import type { SavingsGoal } from '@/lib/advanced';

type Goal = SavingsGoal & {
  description: string;
};

export default function GoalsScreen() {
  const flow = useFlowStore((state) => state.flow);
  const { track } = useAnalytics();
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: 'emergency',
      name: 'Emergency buffer',
      target: 3000,
      saved: 1800,
      description: 'Three months of fixed expenses so surprises feel smaller.',
      priority: 'essential',
      category: 'emergency',
      deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
    },
    {
      id: 'trip',
      name: 'Trip fund',
      target: 1200,
      saved: 450,
      description: 'A long weekend away without touching the emergency stash.',
      priority: 'important',
      category: 'lifestyle',
      deadline: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 4 months
    },
    {
      id: 'tax',
      name: 'Tax reserve',
      target: 2500,
      saved: 900,
      description: 'Keep quarterly estimates ready to send without stress.',
      priority: 'essential',
      category: 'other',
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months
    },
  ]);

  // Calculate safe-to-save amount using advanced algorithm
  const safeToSaveData = useMemo(() => {
    if (!flow) return null;
    
    const today = new Date(flow.today);
    const currentBalance = flow.accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
    
    return calculateSafeToSave(
      flow.forecastDays,
      flow.recurrences,
      flow.transactions,
      currentBalance,
      flow.runwayDays,
      today,
      flow.userBuffer,
      'moderate',
    );
  }, [flow]);

  const safeAmount = safeToSaveData?.amount ?? 0;

  // Prioritize goals using advanced algorithm
  const prioritizedGoals = useMemo(() => {
    if (!flow || !safeToSaveData) return goals;

    const monthlyExpenses = Math.abs(
      flow.recurrences.filter((r) => r.amount < 0).reduce((sum, r) => sum + r.amount, 0)
    );
    const monthlyIncome = flow.recurrences
      .filter((r) => r.amount > 0)
      .reduce((sum, r) => sum + r.amount, 0);
    const currentEmergencyFund = goals.find((g) => g.category === 'emergency')?.saved ?? 0;

    const prioritized = prioritizeGoals({
      goals,
      runwayDays: flow.runwayDays,
      monthlyIncome,
      monthlyExpenses,
      currentEmergencyFund,
      safeToSaveAmount: safeAmount,
    });

    // Merge with existing goals to keep description
    return goals.map((goal) => {
      const prioritizedGoal = prioritized.find((p) => p.id === goal.id);
      return prioritizedGoal ? { ...goal, ...prioritizedGoal } : goal;
    });
  }, [flow, goals, safeAmount, safeToSaveData]);

  const handleAddToGoal = (goalId: string) => {
    setGoals((current) =>
      current.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              saved: Math.min(goal.target, goal.saved + safeAmount),
            }
          : goal,
      ),
    );
    track('suggestion_accept', { goalId });
  };

  const handleResetGoal = (goalId: string) => {
    setGoals((current) =>
      current.map((goal) => (goal.id === goalId ? { ...goal, saved: 0 } : goal)),
    );
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" className="flex-1 bg-offwhite">
      <View className="px-6 pb-6 pt-16 md:px-12 lg:px-24">
        <Text className="text-sm font-medium uppercase tracking-[0.2em] text-blue">Goals</Text>
        <Text className="mt-2 text-4xl font-semibold text-navy md:text-5xl">Build cushions that feel right</Text>
        <Text className="mt-4 max-w-3xl text-lg text-gray">
          Tie your savings to the forecast so every transfer feels safe. We’ll suggest bite-sized moves that keep your
          runway healthy.
        </Text>
      </View>

      <View className="px-6 py-4 md:px-12 lg:px-24">
        <Section
          eyebrow="Safe to save"
          title="You can comfortably move"
          description="Advanced analysis of your P10 forecast band with intelligent buffer calculation."
        >
          <Card className="bg-white/90">
            <Text className="text-4xl font-semibold text-navy">${safeAmount}</Text>
            <Text className="mt-2 text-base text-gray">
              {safeToSaveData?.reasoning || 'Calculating your safe savings amount...'}
            </Text>
            {safeToSaveData && safeToSaveData.confidence > 0 && (
              <Text className="mt-4 text-sm text-gray">
                Confidence: {Math.round(safeToSaveData.confidence * 100)}% • Best to transfer on{' '}
                {safeToSaveData.recommendedDate.toLocaleDateString()}
              </Text>
            )}
          </Card>
        </Section>
      </View>

      <View className="px-6 py-4 md:px-12 lg:px-24">
        <Section
          eyebrow="Goals"
          title="Prioritized savings goals"
          description="Intelligently ranked based on urgency, impact, and feasibility."
        >
          <View className="space-y-4">
            {prioritizedGoals.map((goal) => {
              const progress = Math.min(1, goal.saved / goal.target);
              const remaining = goal.target - goal.saved;
              const isPrioritized = 'rank' in goal;
              const rank = isPrioritized ? (goal as any).rank : 0;
              const reasoning = isPrioritized ? (goal as any).reasoning : '';
              
              return (
                <Card 
                  key={goal.id} 
                  title={goal.name}
                  subtitle={rank > 0 ? `Priority #${rank}` : undefined}
                  description={goal.description}
                >
                  <View className="mt-2">
                    <View className="h-2 w-full rounded-full bg-blue/10">
                      <View className="h-2 rounded-full bg-blue" style={{ width: `${progress * 100}%` }} />
                    </View>
                    <Text className="mt-2 text-sm text-gray">
                      ${goal.saved.toLocaleString()} saved of ${goal.target.toLocaleString()}
                    </Text>
                    {reasoning && (
                      <Text className="mt-2 text-xs text-gray italic">{reasoning}</Text>
                    )}
                  </View>
                  <View className="mt-4 flex-row flex-wrap items-center gap-3">
                    <Button 
                      title={`Add $${safeAmount}`} 
                      onPress={() => handleAddToGoal(goal.id)}
                      disabled={safeAmount === 0}
                    />
                    <Pressable onPress={() => handleResetGoal(goal.id)} accessibilityRole="button">
                      <Text className="text-sm font-medium text-blue">Reset</Text>
                    </Pressable>
                    <Text className="text-sm text-gray">
                      {remaining > 0 && safeAmount > 0
                        ? `${Math.ceil(remaining / safeAmount)} transfers away`
                        : remaining > 0
                          ? 'Build runway first'
                          : 'Completed!'}
                    </Text>
                  </View>
                </Card>
              );
            })}
          </View>
        </Section>
      </View>

      <View className="px-6 pb-24 pt-4 md:px-12 lg:px-24">
        <Section
          eyebrow="Buffer"
          title="Why this matters"
          description="Goals stay synced with your forecast, so you never starve the everyday account."
        >
          <Card className="bg-blue/5">
            <Text className="text-base text-gray">
              SaverFlow automatically pauses SmartSave suggestions if your runway dips below two weeks or if a large
              unexpected charge shows up. Your calm cushion comes first.
            </Text>
          </Card>
        </Section>
      </View>
    </ScrollView>
  );
}
