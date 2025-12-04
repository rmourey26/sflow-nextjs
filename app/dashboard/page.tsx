import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/actions/user"
import { getAccounts } from "@/lib/actions/accounts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const [userData, accounts] = await Promise.all([getCurrentUser(), getAccounts()])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userData?.name || "there"}!</h1>
          <p className="text-gray-600 mt-2">Here&apos;s your financial overview</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Accounts</CardTitle>
              <CardDescription>Connected bank accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{accounts.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Balance</CardTitle>
              <CardDescription>Across all accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">
                ${accounts.reduce((sum, acc) => sum + Number.parseFloat(acc.balance), 0).toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>Current plan</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold capitalize">{userData?.subscription_tier || "Free"}</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with SaverFlow</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button>Add Account</Button>
              <Button variant="outline">Create Goal</Button>
              <Button variant="outline">View Forecast</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
