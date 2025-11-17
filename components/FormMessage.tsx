import { Text, View } from 'react-native';

type FormMessageProps = {
  tone?: 'success' | 'error' | 'info';
  message: string;
  testID?: string;
};

const toneStyles: Record<NonNullable<FormMessageProps['tone']>, { container: string; text: string }> = {
  success: { container: 'bg-lime/15 border-lime/40', text: 'text-navy' },
  error: { container: 'bg-[#FDECEC] border-[#F43F5E]/50', text: 'text-[#B91C1C]' },
  info: { container: 'bg-blue/10 border-blue/30', text: 'text-navy' },
};

export function FormMessage({ tone = 'info', message, testID }: FormMessageProps) {
  const toneClass = toneStyles[tone];
  return (
    <View
      accessibilityRole="text"
      accessibilityLiveRegion="polite"
      className={`mt-4 rounded-2xl border px-4 py-3 ${toneClass.container}`}
      testID={testID}
    >
      <Text className={`text-sm ${toneClass.text}`}>{message}</Text>
    </View>
  );
}
