import { View, Text } from 'react-native';
import { MoveRight, X } from 'lucide-react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import type { Suggestion } from '@/types';

type SuggestionCardProps = {
  suggestion: Suggestion;
  onApprove?: () => void;
  onDismiss?: () => void;
  loading?: boolean;
};

export function SuggestionCard({ suggestion, onApprove, onDismiss, loading }: SuggestionCardProps) {
  return (
    <Card
      subtitle="SmartSave"
      title={suggestion.title}
      description={suggestion.rationale}
      footer={
        <View className="flex-row flex-wrap items-center gap-3">
          <Button
            title={`Approve - move $${suggestion.transferAmount.toFixed(0)}`}
            onPress={onApprove}
            loading={loading}
            iconRight={<MoveRight color="#FAFAFA" size={18} />}
          />
          <Button
            title="Dismiss"
            onPress={onDismiss}
            variant="ghost"
            iconRight={<X color="#4A90E2" size={18} />}
          />
          <Text className="text-sm text-gray">
            Extends runway by {suggestion.expectedRunwayChangeDays} day
            {suggestion.expectedRunwayChangeDays === 1 ? '' : 's'}.
          </Text>
        </View>
      }
    >
      <View className="rounded-2xl bg-blue/5 px-4 py-3">
        <Text className="text-sm font-medium text-blue">
          Scheduled for {new Date(suggestion.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
        </Text>
      </View>
    </Card>
  );
}
