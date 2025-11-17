import { useMemo } from 'react';
import { View } from 'react-native';
import { VictoryArea, VictoryAxis, VictoryChart, VictoryClipContainer, VictoryGroup } from 'victory-native';

import type { ForecastDay } from '@/types';

type ForecastChartProps = {
  data: ForecastDay[];
  height?: number;
};

export function ForecastChart({ data, height = 240 }: ForecastChartProps) {
  const processed = useMemo(
    () =>
      data.map((item) => ({
        date: new Date(item.date),
        p10: item.p10Total,
        p50: item.p50Total,
        p90: item.p90Total,
      })),
    [data],
  );

  if (!processed.length) {
    return <View className="h-[200px] w-full items-center justify-center rounded-3xl bg-white/60" />;
  }

  return (
    <View className="w-full rounded-3xl bg-white/80 p-4 shadow-card">
      <VictoryChart
        height={height}
        padding={{ top: 40, bottom: 60, left: 60, right: 24 }}
        scale={{ x: 'time' }}
        domainPadding={{ y: 20 }}
      >
        <VictoryAxis
          tickFormat={(value: Date | number | string) => {
            const date =
              value instanceof Date ? value : typeof value === 'number' ? new Date(value) : new Date(value ?? Date.now());
            return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          }}
          style={{
            axis: { stroke: 'rgba(10, 25, 48, 0.2)' },
            tickLabels: { fill: '#6B7280', fontFamily: 'Inter', fontSize: 12 },
            grid: { stroke: 'rgba(10, 25, 48, 0.08)', strokeDasharray: '4 4' },
          }}
        />
        <VictoryAxis
          dependentAxis
          tickFormat={(value: number) => `$${Math.round(value).toLocaleString()}`}
          style={{
            axis: { stroke: 'transparent' },
            tickLabels: { fill: '#6B7280', fontFamily: 'Inter', fontSize: 12 },
            grid: { stroke: 'rgba(10, 25, 48, 0.08)', strokeDasharray: '4 4' },
          }}
        />

        <VictoryGroup data={processed} x="date" y="p50">
          <VictoryArea
            interpolation="natural"
            data={processed}
            x="date"
            y="p90"
            y0={(d: typeof processed[number]) => d.p10}
            style={{ data: { fill: 'rgba(74, 144, 226, 0.18)', strokeWidth: 0 } }}
            groupComponent={<VictoryClipContainer clipPadding={{ top: 5, right: 0 }} />}
          />
          <VictoryArea
            interpolation="natural"
            data={processed}
            x="date"
            y="p50"
            style={{ data: { stroke: '#4A90E2', strokeWidth: 3, fill: 'transparent' } }}
          />
        </VictoryGroup>
      </VictoryChart>
    </View>
  );
}
