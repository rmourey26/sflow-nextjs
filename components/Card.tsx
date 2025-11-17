import type { ReactNode } from 'react';
import { View, Text } from 'react-native';

import { cn } from '@/lib/utils/cn';

type CardProps = {
  title?: string;
  subtitle?: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
  accent?: 'navy' | 'blue' | 'lime';
};

const accentClassName: Record<NonNullable<CardProps['accent']>, string> = {
  navy: 'text-navy',
  blue: 'text-blue',
  lime: 'text-lime',
};

export function Card({ title, subtitle, description, children, footer, className, accent = 'navy' }: CardProps) {
  return (
    <View className={cn('rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-card', className)}>
      {subtitle ? <Text className="text-xs font-medium uppercase tracking-[0.2em] text-blue">{subtitle}</Text> : null}
      {title ? <Text className={cn('mt-2 text-2xl font-semibold', accentClassName[accent])}>{title}</Text> : null}
      {description ? <Text className="mt-2 text-base leading-relaxed text-gray">{description}</Text> : null}
      {children ? <View className="mt-4">{children}</View> : null}
      {footer ? <View className="mt-6 border-t border-[#F1F5F9] pt-4">{footer}</View> : null}
    </View>
  );
}
