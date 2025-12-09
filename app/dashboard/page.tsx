import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/actions/user"
import { getAccounts } from "@/lib/actions/accounts"
import { getTransactions } from "@/lib/actions/transactions"
import { getGoals } from "@/lib/actions/goals"
import { getSmartActions } from "@/lib/actions/smart-actions"
import { getForecast } from "@/lib/actions/forecasts"
import { DashboardHeader } from "@/components/dashboard/header"
import { AccountsOverview } from "@/components/dashboard/accounts-overview"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { SavingsGoalsWidget } from "@/components/dashboard/savings-goals-widget"
import { SmartActionsWidget } from "@/components/dashboard/smart-actions-widget"
import { ForecastChart } from "@/components/dashboard/forecast-chart"
import { QuickStats } from "@/components/dashboard/quick-stats"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const [userData, accounts, transactions, goals, smartActions, forecast] = await Promise.all([
    getCurrentUser(),
    getAccounts(),
    getTransactions(undefined, 10),
    getGoals(),
    getSmartActions("suggested"),
    getForecast(90),
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <DashboardHeader user={userData} />

      <main className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
        <QuickStats accounts={accounts} transactions={transactions} goals={goals} />

        {forecast && <ForecastChart forecast={forecast} />}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <AccountsOverview accounts={accounts} />
            <RecentTransactions transactions={transactions} />
          </div>

          <div className="space-y-6">
            <SavingsGoalsWidget goals={goals} />
            <SmartActionsWidget actions={smartActions} />
          </div>
        </div>
      </main>
    </div>
  )
}
