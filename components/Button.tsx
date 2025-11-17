import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { cn } from '@/lib/utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  testID?: string;
};

const baseStyles =
  'flex-row items-center justify-center rounded-full transition-all active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-blue text-white focus-visible:outline-blue shadow-card',
  secondary: 'bg-navy text-offwhite focus-visible:outline-navy shadow-card',
  outline: 'border border-blue text-blue bg-transparent focus-visible:outline-blue',
  ghost: 'bg-transparent text-blue focus-visible:outline-blue',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-10 px-4 text-sm',
  md: 'h-12 px-6 text-base',
  lg: 'h-14 px-8 text-lg',
};

export function Button({
  title,
  iconLeft,
  iconRight,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  onPress,
  accessibilityLabel,
  testID,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        isDisabled && 'opacity-60',
        loading && 'cursor-progress',
      )}
      disabled={isDisabled}
      onPress={onPress}
      testID={testID}
    >
      {iconLeft ? <View className="mr-2">{iconLeft}</View> : null}
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? '#0A1930' : '#ffffff'} />
      ) : (
        <Text className={cn('font-semibold', size === 'lg' && 'text-lg')} selectable={false}>
          {title}
        </Text>
      )}
      {iconRight ? <View className="ml-2">{iconRight}</View> : null}
    </Pressable>
  );
}
