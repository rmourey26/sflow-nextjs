import type { ReactNode } from 'react';
import { View, Text } from 'react-native';

type Feature = {
  id: string;
  title: string;
  description: string;
  icon?: ReactNode;
};

type FeatureListProps = {
  items: Feature[];
  columns?: 1 | 2 | 3;
};

export function FeatureList({ items, columns = 2 }: FeatureListProps) {
  const gridClass = columns === 1 ? 'grid-cols-1' : columns === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3';

  return (
    <View className={`grid gap-6 ${gridClass}`}>
      {items.map((item) => (
        <View
          key={item.id}
          className="rounded-2xl border border-[#E8EDF5] bg-white/70 p-6 shadow-card backdrop-blur-sm"
          accessibilityRole="summary"
        >
          {item.icon ? <View className="mb-4 h-12 w-12 items-center justify-center rounded-full bg-blue/10">{item.icon}</View> : null}
          <Text className="text-xl font-semibold text-navy">{item.title}</Text>
          <Text className="mt-2 text-base leading-relaxed text-gray">{item.description}</Text>
        </View>
      ))}
    </View>
  );
}
