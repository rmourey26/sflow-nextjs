import { getAccounts } from "@/lib/actions/accounts"
import { getTransactions } from "@/lib/actions/transactions"
import { AccountsOverview } from "@/components/dashboard/accounts-overview"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"

export default async function AccountsPage() {
  const [accounts, transactions] = await Promise.all([getAccounts(), getTransactions(undefined, 50)])

  return (
    <main className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
        <p className="text-gray-600">Manage your connected accounts and transactions</p>
      </div>

      <AccountsOverview accounts={accounts || []} />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">All Transactions</h2>
        <RecentTransactions transactions={transactions || []} showAll />
      </div>
    </main>
  )
}
