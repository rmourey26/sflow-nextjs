import { View, Text } from 'react-native';

type ForecastLegendProps = {
  runwayDays: number;
  confidence: number;
};

export function ForecastLegend({ runwayDays, confidence }: ForecastLegendProps) {
  return (
    <View className="flex-row flex-wrap items-center gap-4 rounded-3xl border border-[#E8EDF5] bg-white/80 px-4 py-3">
      <View className="flex-row items-center gap-2">
        <View className="h-2 w-6 rounded-full bg-blue" />
        <Text className="text-sm font-medium text-navy">P50 forecast</Text>
      </View>
      <View className="flex-row items-center gap-2">
        <View className="h-2 w-6 rounded-full bg-blue/20" />
        <Text className="text-sm text-gray">P10 - P90 range</Text>
      </View>
      <View className="flex-row items-center gap-2">
        <View className="h-8 w-8 items-center justify-center rounded-2xl bg-lime/20">
          <Text className="text-base font-semibold text-navy">{runwayDays}</Text>
        </View>
        <Text className="text-sm text-gray">Runway days</Text>
      </View>
      <View className="flex-row items-center gap-2">
        <View className="h-8 w-8 items-center justify-center rounded-2xl bg-blue/10">
          <Text className="text-base font-semibold text-navy">{confidence}%</Text>
        </View>
        <Text className="text-sm text-gray">Forecast confidence</Text>
      </View>
    </View>
  );
}
