import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, TrendingUp, Target } from "lucide-react"
import type { Database } from "@/types/database"

type Account = Database["public"]["Tables"]["accounts"]["Row"]
type Transaction = Database["public"]["Tables"]["transactions"]["Row"]
type SavingsGoal = Database["public"]["Tables"]["savings_goals"]["Row"]

interface QuickStatsProps {
  accounts: Account[]
  transactions: Transaction[]
  goals: SavingsGoal[]
}

export function QuickStats({ accounts, transactions, goals }: QuickStatsProps) {
  const totalBalance = accounts.reduce((sum, acc) => sum + Number.parseFloat(acc.balance), 0)

  const thisMonthTransactions = transactions.filter((t) => {
    const txDate = new Date(t.date)
    const now = new Date()
    return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear()
  })

  const monthlyIncome = thisMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number.parseFloat(t.amount), 0)

  const monthlyExpenses = thisMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number.parseFloat(t.amount), 0)

  const activeGoals = goals.filter((g) => !g.completed).length
  const goalsProgress =
    goals.reduce((sum, g) => {
      const progress = (Number.parseFloat(g.current_amount) / Number.parseFloat(g.target_amount)) * 100
      return sum + Math.min(progress, 100)
    }, 0) / (goals.length || 1)

  const stats = [
    {
      title: "Total Balance",
      value: `$${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: "+2.5%",
      positive: true,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Monthly Income",
      value: `$${monthlyIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: `${transactions.filter((t) => t.type === "income").length} transactions`,
      positive: true,
      icon: ArrowUpRight,
      color: "text-teal-600",
      bgColor: "bg-teal-100",
    },
    {
      title: "Monthly Expenses",
      value: `$${monthlyExpenses.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: `${transactions.filter((t) => t.type === "expense").length} transactions`,
      positive: false,
      icon: ArrowDownRight,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Active Goals",
      value: `${activeGoals}`,
      change: `${goalsProgress.toFixed(0)}% avg progress`,
      positive: true,
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                  <p className={`text-xs ${stat.positive ? "text-teal-600" : "text-gray-500"}`}>{stat.change}</p>
                </div>
                <div className={`rounded-full p-3 ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
