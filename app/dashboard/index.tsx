import { useEffect, useMemo, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ForecastChart } from '@/components/Chart';
import { ForecastLegend } from '@/components/ForecastLegend';
import { SuggestionCard } from '@/components/SuggestionCard';
import { TooltipSheet } from '@/components/TooltipSheet';
import { generateMockFlowState } from '@/lib/mockData';
import { enhanceWithAdvancedFeatures, calculateWhatIfScenario } from '@/lib/advanced';
import { useAnalytics } from '@/lib/analytics/provider';
import { useFlowStore } from '@/store/useFlowStore';

export default function DashboardScreen() {
  const flow = useFlowStore((state) => state.flow);
  const setFlow = useFlowStore((state) => state.setFlow);
  const setMode = useFlowStore((state) => state.setMode);
  const updateSuggestion = useFlowStore((state) => state.updateSuggestion);
  const loading = useFlowStore((state) => state.loading);
  const setLoading = useFlowStore((state) => state.setLoading);
  const { track } = useAnalytics();
  const [showScenarioSheet, setShowScenarioSheet] = useState(false);
  const [scenarioMessage, setScenarioMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!flow) {
      setLoading(true);
      const mock = generateMockFlowState({ seed: 'dashboard-default' });
      // Enhance with advanced features
      const enhanced = enhanceWithAdvancedFeatures(mock);
      setFlow(enhanced);
      setMode('manual');
      setLoading(false);
    }
  }, [flow, setFlow, setLoading, setMode]);

  const upcoming = useMemo(() => {
    if (!flow) return [];
    return flow.recurrences
      .map((item) => ({
        id: item.name,
        name: item.name,
        amount: item.amount,
        date: new Date(item.nextDate),
        cadence: item.cadence,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 3);
  }, [flow]);

  const handleScenario = (scenario: 'delay' | 'cancel' | 'purchase') => {
    if (!flow) {
      return;
    }

    let adjusted;
    let message = '';

    switch (scenario) {
      case 'delay':
        adjusted = calculateWhatIfScenario(flow, 'delay_bill', 0);
        message = `Delaying that bill by 5 days extends your runway to ${adjusted.runwayDays} days (${adjusted.runwayDays - flow.runwayDays > 0 ? '+' : ''}${adjusted.runwayDays - flow.runwayDays} days).`;
        break;
      case 'cancel':
        adjusted = calculateWhatIfScenario(flow, 'cancel_subscription', 40);
        message = `Canceling the subscription extends your runway to ${adjusted.runwayDays} days (${adjusted.runwayDays - flow.runwayDays > 0 ? '+' : ''}${adjusted.runwayDays - flow.runwayDays} days).`;
        break;
      case 'purchase':
        adjusted = calculateWhatIfScenario(flow, 'add_expense', 150);
        message = `Adding a $150 purchase reduces your runway to ${adjusted.runwayDays} days (${adjusted.runwayDays - flow.runwayDays} days).`;
        break;
      default:
        return;
    }

    setFlow(adjusted, new Date().toISOString());
    setScenarioMessage(message);
    track('forecast_view', { scenario, runwayChange: adjusted.runwayDays - flow.runwayDays });
    setShowScenarioSheet(false);
  };

  const handleSuggestionApprove = () => {
    if (!flow?.suggestion) return;
    updateSuggestion({ status: 'accepted' });
    track('suggestion_accept', { id: flow.suggestion.id });
    setScenarioMessage('Great! We’ll nudge you on Friday to move the $25 across.');
  };

  const handleSuggestionDismiss = () => {
    if (!flow?.suggestion) return;
    updateSuggestion({ status: 'dismissed' });
    track('suggestion_dismiss', { id: flow.suggestion.id });
  };

  if (loading || !flow) {
    return (
      <View className="flex-1 items-center justify-center bg-offwhite">
        <Text className="text-base text-gray">Loading your forecast…</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView contentInsetAdjustmentBehavior="automatic" className="flex-1 bg-offwhite">
        <View className="px-6 pb-6 pt-16 md:px-12 lg:px-24">
          <Text className="text-sm font-medium uppercase tracking-[0.2em] text-blue">Forecast</Text>
          <Text className="mt-2 text-4xl font-semibold text-navy md:text-5xl">Your next 90 days</Text>
          <Text className="mt-4 max-w-3xl text-lg text-gray">
            This is your money weather report. Keep an eye on runway, confidence, and the small actions that keep you
            ahead.
          </Text>
        </View>

        <View className="px-6 py-4 md:px-12 lg:px-24">
          <Card className="bg-white/90" title={`${flow.runwayDays} days of runway`}>
            <View className="flex-row flex-wrap items-center justify-between gap-4">
              <View>
                <Text className="text-sm text-gray">Forecast confidence</Text>
                <Text className="text-3xl font-semibold text-navy">{flow.confidence}%</Text>
              </View>
              <View className="flex-1">
                <ForecastLegend runwayDays={flow.runwayDays} confidence={flow.confidence} />
              </View>
              <Button title="What if…" variant="outline" onPress={() => setShowScenarioSheet(true)} />
            </View>
          </Card>
        </View>

        <View className="px-6 py-4 md:px-12 lg:px-24">
          <ForecastChart data={flow.forecastDays} />
        </View>

        <View className="px-6 py-4 md:px-12 lg:px-24">
          <Card
            subtitle="Coming up"
            title="Next expected items"
            description="These are the next few inflows and outflows we’re watching."
          >
            <View className="space-y-3">
              {upcoming.map((item) => (
                <View key={item.id} className="flex-row items-center justify-between rounded-2xl bg-blue/5 px-4 py-3">
                  <View>
                    <Text className="text-base font-medium text-navy">{item.name}</Text>
                    <Text className="text-sm text-gray">
                      {item.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {item.cadence}
                    </Text>
                  </View>
                  <Text className="text-base font-semibold text-navy">
                    {item.amount < 0 ? '-' : ''}
                    ${Math.abs(item.amount).toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {flow.suggestion ? (
          <View className="px-6 py-4 md:px-12 lg:px-24">
            <SuggestionCard
              suggestion={flow.suggestion}
              onApprove={handleSuggestionApprove}
              onDismiss={handleSuggestionDismiss}
            />
          </View>
        ) : null}

        {scenarioMessage ? (
          <View className="px-6 py-4 md:px-12 lg:px-24">
            <Card className="bg-lime/10" title="Scenario update" description={scenarioMessage} />
          </View>
        ) : null}
      </ScrollView>

      <TooltipSheet
        visible={showScenarioSheet}
        onClose={() => setShowScenarioSheet(false)}
        title="Try a quick scenario"
        description="See how a small change shifts your runway instantly."
      >
        <View className="space-y-3">
          <Button title="Delay next big bill by 5 days" onPress={() => handleScenario('delay')} />
          <Button title="Cancel a $40 subscription" onPress={() => handleScenario('cancel')} variant="secondary" />
          <Button title="Add a $150 one-time purchase" onPress={() => handleScenario('purchase')} variant="outline" />
        </View>
      </TooltipSheet>
    </>
  );
}
