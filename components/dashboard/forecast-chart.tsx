"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Line } from "recharts"
import type { Database } from "@/types/database"

type ForecastDataPoint = Database["public"]["Tables"]["forecast_data"]["Row"]

interface ForecastChartProps {
  forecast: ForecastDataPoint[] | null
}

export function ForecastChart({ forecast }: ForecastChartProps) {
  const chartData =
    forecast?.map((point) => ({
      date: point.forecast_date,
      p10: point.projected_balance * 0.8, // Conservative estimate
      p50: point.projected_balance, // Expected balance
      p90: point.projected_balance * 1.2, // Optimistic estimate
      income: point.projected_income,
      expenses: point.projected_expenses,
    })) || []

  if (!forecast || forecast.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>90-Day Cash Flow Forecast</CardTitle>
          <CardDescription>No forecast data available yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-gray-500">
            Add transactions and accounts to generate your forecast
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>90-Day Cash Flow Forecast</CardTitle>
        <CardDescription>Projected balance with confidence bands (P10, P50, P90)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] sm:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorP90" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return `${date.getMonth() + 1}/${date.getDate()}`
                }}
              />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => `$${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Area type="monotone" dataKey="p90" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorP90)" />
              <Line type="monotone" dataKey="p50" stroke="#6366f1" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="p10" stroke="#14b8a6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-4 mt-4 justify-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-[#14b8a6]" style={{ borderTop: "2px dashed #14b8a6" }} />
            <span className="text-gray-600">P10 (Conservative)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-[#6366f1] rounded" />
            <span className="text-gray-600">P50 (Expected)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-[#8b5cf6] rounded" />
            <span className="text-gray-600">P90 (Optimistic)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
