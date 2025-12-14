import { getAccounts } from "@/lib/actions/accounts"
import { getTransactions } from "@/lib/actions/transactions"
import { getGoals } from "@/lib/actions/goals"
import { getSmartActions } from "@/lib/actions/smart-actions"
import { getForecast } from "@/lib/actions/forecasts"
import { AccountsOverview } from "@/components/dashboard/accounts-overview"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { SavingsGoalsWidget } from "@/components/dashboard/savings-goals-widget"
import { SmartActionsWidget } from "@/components/dashboard/smart-actions-widget"
import { ForecastChart } from "@/components/dashboard/forecast-chart"
import { QuickStats } from "@/components/dashboard/quick-stats"

export default async function DashboardPage() {
  const [accounts, transactions, goals, smartActions, forecast] = await Promise.all([
    getAccounts(),
    getTransactions(undefined, 10),
    getGoals(),
    getSmartActions("suggested"),
    getForecast(90),
  ])

  return (
    <main className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
      <QuickStats accounts={accounts || []} transactions={transactions || []} goals={goals || []} />

      <ForecastChart forecast={forecast || []} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <AccountsOverview accounts={accounts || []} />
          <RecentTransactions transactions={transactions || []} />
        </div>

        <div className="space-y-6">
          <SavingsGoalsWidget goals={goals || []} />
          <SmartActionsWidget actions={smartActions || []} />
        </div>
      </div>
    </main>
  )
}
