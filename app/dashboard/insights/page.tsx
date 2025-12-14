import { getSmartActions } from "@/lib/actions/smart-actions"
import { getForecast } from "@/lib/actions/forecasts"
import { SmartActionsWidget } from "@/components/dashboard/smart-actions-widget"
import { ForecastChart } from "@/components/dashboard/forecast-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, AlertTriangle, Lightbulb } from "lucide-react"

export default async function InsightsPage() {
  const [smartActions, forecast] = await Promise.all([getSmartActions("suggested"), getForecast(90)])

  return (
    <main className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Financial Insights</h1>
        <p className="text-gray-600">AI-powered recommendations for your finances</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Insights</CardTitle>
            <Lightbulb className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{smartActions?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Smart suggestions available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Forecast Accuracy</CardTitle>
            <TrendingUp className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">Based on recent history</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">No urgent issues</p>
          </CardContent>
        </Card>
      </div>

      <ForecastChart forecast={forecast || []} />

      <SmartActionsWidget actions={smartActions || []} />
    </main>
  )
}
