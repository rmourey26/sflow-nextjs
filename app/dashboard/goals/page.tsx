import { getGoals } from "@/lib/actions/goals"
import { GoalsManagement } from "@/components/dashboard/goals-management"

export default async function GoalsPage() {
  const goals = await getGoals()

  return (
    <main className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Savings Goals</h1>
        <p className="text-gray-600">Track and manage your financial goals</p>
      </div>

      <GoalsManagement goals={goals || []} />
    </main>
  )
}
