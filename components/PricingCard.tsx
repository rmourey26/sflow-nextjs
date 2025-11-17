import type { ReactNode } from 'react';
import { View, Text } from 'react-native';

import { Button } from '@/components/Button';
import { cn } from '@/lib/utils/cn';

type PricingCardProps = {
  name: string;
  priceMonthly: string;
  priceYearly?: string;
  description: string;
  features: string[];
  valueLine?: string;
  highlight?: boolean;
  actionLabel?: string;
  onPress?: () => void;
  footer?: ReactNode;
};

export function PricingCard({
  name,
  priceMonthly,
  priceYearly,
  description,
  features,
  valueLine,
  highlight,
  actionLabel = 'Start free trial',
  onPress,
  footer,
}: PricingCardProps) {
  return (
    <View
      className={cn(
        'flex-1 rounded-3xl border border-[#E5E7EB] bg-white/90 p-8 shadow-card backdrop-blur-sm',
        highlight && 'border-blue bg-blue/5 shadow-lg shadow-blue/20',
      )}
      accessibilityRole="summary"
    >
      <Text className="text-sm font-semibold uppercase tracking-[0.18em] text-blue">{name}</Text>
      <Text className="mt-4 text-3xl font-semibold text-navy">{priceMonthly}</Text>
      {priceYearly ? <Text className="mt-1 text-sm text-gray">{priceYearly}</Text> : null}
      <Text className="mt-4 text-base leading-relaxed text-gray">{description}</Text>
      {valueLine ? <Text className="mt-3 text-sm font-medium text-blue">{valueLine}</Text> : null}

      <View className="mt-6 space-y-3">
        {features.map((feature) => (
          <View key={feature} className="flex-row items-start gap-3">
            <Text className="mt-[2px] text-blue">•</Text>
            <Text className="flex-1 text-base text-navy">{feature}</Text>
          </View>
        ))}
      </View>

      <View className="mt-8">
        <Button title={actionLabel} onPress={onPress} variant={highlight ? 'primary' : 'secondary'} />
      </View>

      {footer ? <View className="mt-6">{footer}</View> : null}
    </View>
  );
}
