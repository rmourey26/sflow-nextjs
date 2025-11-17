import { useEffect, useMemo } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { addDays, addWeeks, format, isWithinInterval, startOfWeek } from 'date-fns';

import { Card } from '@/components/Card';
import { Section } from '@/components/Section';
import { useAnalytics } from '@/lib/analytics/provider';
import { useFlowStore } from '@/store/useFlowStore';
import { 
  generateWeeklySummaries,
  analyzeTrend,
  calculateBurnRate,
  getTopSpendingCategories,
} from '@/lib/advanced';

type WeeklySummary = {
  id: string;
  label: string;
  inflow: number;
  outflow: number;
  net: number;
};

export default function InsightsScreen() {
  const flow = useFlowStore((state) => state.flow);
  const { track } = useAnalytics();

  useEffect(() => {
    track('weekly_report_view');
  }, [track]);

  // Use advanced cash flow analysis
  const weeklySummaries = useMemo<WeeklySummary[]>(() => {
    if (!flow) return [];

    const summaries = generateWeeklySummaries(flow.transactions, 4);
    
    return summaries.map((summary) => ({
      id: summary.weekStart.toISOString(),
      label: `${format(summary.weekStart, 'MMM d')} - ${format(summary.weekEnd, 'MMM d')}`,
      inflow: summary.inflow,
      outflow: summary.outflow,
      net: summary.net,
    }));
  }, [flow]);

  // Advanced trend analysis
  const trendAnalysis = useMemo(() => {
    if (!flow) return null;
    return analyzeTrend(flow.forecastDays, 'balance');
  }, [flow]);

  // Burn rate analysis
  const burnRate = useMemo(() => {
    if (!flow) return null;
    return calculateBurnRate(flow.transactions, 30);
  }, [flow]);

  // Top spending categories
  const topCategories = useMemo(() => {
    if (!flow) return [];
    return getTopSpendingCategories(flow.transactions, 5);
  }, [flow]);

  const wins = useMemo(() => {
    if (!flow) return [];
    return [
      {
        id: 'runway',
        title: 'You are ahead',
        detail: `Runway sits at ${flow.runwayDays} days — ${flow.runwayDays - 42 >= 0 ? `${flow.runwayDays - 42} days` : 'a few days'} stronger than the baseline we track.`,
      },
      {
        id: 'savings',
        title: 'Savings streak continues',
        detail: 'SmartSave nudges landed three times in the last month, adding $120 to your buffer.',
      },
    ];
  }, [flow]);

  const trends = useMemo(() => {
    if (!weeklySummaries.length || !trendAnalysis || !burnRate) return [];
    const latest = weeklySummaries[weeklySummaries.length - 1];

    const items = [
      {
        id: 'trend',
        title: 'Balance trend',
        detail: trendAnalysis.description,
      },
      {
        id: 'burn',
        title: 'Burn rate',
        detail: `Spending approximately $${burnRate.weeklyBurnRate.toLocaleString()}/week. Trend: ${burnRate.trend}.`,
      },
    ];

    // Add spending category insight
    if (topCategories.length > 0) {
      const topCat = topCategories[0];
      items.push({
        id: 'top-category',
        title: 'Top spending category',
        detail: `${topCat.category}: $${Math.round(topCat.amount).toLocaleString()} (${topCat.percentage}% of expenses)`,
      });
    }

    return items;
  }, [weeklySummaries, trendAnalysis, burnRate, topCategories]);

  if (!flow) {
    return (
      <View className="flex-1 items-center justify-center bg-offwhite">
        <Text className="text-base text-gray">Loading insights…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" className="flex-1 bg-offwhite">
      <View className="px-6 pb-6 pt-16 md:px-12 lg:px-24">
        <Text className="text-sm font-medium uppercase tracking-[0.2em] text-blue">Weekly Flow Report</Text>
        <Text className="mt-2 text-4xl font-semibold text-navy md:text-5xl">Insights</Text>
        <Text className="mt-4 max-w-3xl text-lg text-gray">
          A calm summary of the last few weeks: what went well, where spending crept up, and any risks that need a glance.
        </Text>
      </View>

      <View className="px-6 py-4 md:px-12 lg:px-24">
        <Section
          eyebrow="Report"
          title="The past four weeks at a glance"
          description="We balance inflows vs. outflows to spot your patterns. Net numbers are after expenses."
        >
          <View className="grid gap-4 md:grid-cols-2">
            {weeklySummaries.map((summary) => (
              <Card
                key={summary.id}
                title={summary.label}
                description={`Inflow $${Math.round(summary.inflow).toLocaleString()} • Outflow $${Math.abs(
                  Math.round(summary.outflow),
                ).toLocaleString()}`}
              >
                <Text
                  className={`text-lg font-semibold ${
                    summary.net >= 0 ? 'text-blue' : 'text-[#B91C1C]'
                  }`}
                >{`Net ${summary.net >= 0 ? '+' : '-'}$${Math.abs(Math.round(summary.net)).toLocaleString()}`}</Text>
              </Card>
            ))}
          </View>
        </Section>
      </View>

      <View className="px-6 py-4 md:px-12 lg:px-24">
        <Section
          eyebrow="Wins"
          title="What’s working"
          description="Small improvements compound. Here’s what moved the needle recently."
        >
          <View className="space-y-4">
            {wins.map((item) => (
              <Card key={item.id} title={item.title}>
                <Text className="text-base text-gray">{item.detail}</Text>
              </Card>
            ))}
          </View>
        </Section>
      </View>

      <View className="px-6 py-4 md:px-12 lg:px-24">
        <Section
          eyebrow="Trends"
          title="Where the money is heading"
          description="Use these signals to adjust proactively."
        >
          <View className="space-y-4">
            {trends.map((item) => (
              <Card key={item.id} title={item.title}>
                <Text className="text-base text-gray">{item.detail}</Text>
              </Card>
            ))}
          </View>
        </Section>
      </View>

      <View className="px-6 pb-24 pt-4 md:px-12 lg:px-24">
        <Section eyebrow="Risks" title="Keep an eye on these">
          <View className="space-y-3">
            {flow.risks.map((risk) => (
              <Card
                key={risk.id}
                title={risk.title}
                subtitle={format(new Date(risk.date), 'EEE, MMM d')}
                description={risk.description}
                accent={risk.severity === 'critical' ? 'lime' : 'navy'}
              />
            ))}
          </View>
        </Section>
      </View>
    </ScrollView>
  );
}
