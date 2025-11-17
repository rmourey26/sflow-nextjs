import type { ComponentProps } from 'react';
import { TextInput, View, Text } from 'react-native';

import { cn } from '@/lib/utils/cn';

type TextInputProps = ComponentProps<typeof TextInput>;

type InputProps = TextInputProps & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Input({ label, hint, error, className, ...props }: InputProps) {
  return (
    <View className="w-full">
      {label ? (
        <Text className="mb-2 text-sm font-medium text-navy" accessibilityRole="text">
          {label}
        </Text>
      ) : null}
      <TextInput
        accessibilityHint={hint}
        accessibilityLabel={props.accessibilityLabel ?? label}
        className={cn(
          'h-12 w-full rounded-2xl border border-[#D8DFEB] bg-white px-4 text-base text-navy focus-visible:border-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue',
          error && 'border-[#F43F5E]',
          className,
        )}
        placeholderTextColor="rgba(15, 26, 48, 0.4)"
        selectionColor="#4A90E2"
        {...props}
      />
      {hint && !error ? <Text className="mt-2 text-sm text-gray">{hint}</Text> : null}
      {error ? (
        <Text className="mt-2 text-sm text-[#F43F5E]">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
