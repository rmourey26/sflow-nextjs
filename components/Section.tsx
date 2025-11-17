import type { ReactNode } from 'react';
import { View, Text } from 'react-native';

import { cn } from '@/lib/utils/cn';

type SectionProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function Section({ eyebrow, title, description, actions, children, className }: SectionProps) {
  return (
    <View className={cn('w-full', className)}>
      <View className="flex-row items-start justify-between gap-6">
        <View className="flex-1">
          {eyebrow ? (
            <Text className="text-xs font-medium uppercase tracking-[0.2em] text-blue">{eyebrow}</Text>
          ) : null}
          <Text className="mt-2 text-3xl font-semibold text-navy md:text-4xl">{title}</Text>
          {description ? <Text className="mt-4 text-base leading-relaxed text-gray">{description}</Text> : null}
        </View>
        {actions ? <View className="flex-row items-center gap-3">{actions}</View> : null}
      </View>
      {children ? <View className="mt-8">{children}</View> : null}
    </View>
  );
}
