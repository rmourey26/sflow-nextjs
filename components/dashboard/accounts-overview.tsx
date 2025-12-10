"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Wallet, PiggyBank, RefreshCw } from "lucide-react"
import { PlaidLink } from "@/components/integrations/plaid-link"
import type { Database } from "@/types/database"

type Account = Database["public"]["Tables"]["accounts"]["Row"]

interface AccountsOverviewProps {
  accounts: Account[]
}

const accountIcons = {
  checking: Wallet,
  savings: PiggyBank,
  credit: CreditCard,
}

const accountColors = {
  checking: "text-blue-600 bg-blue-100",
  savings: "text-teal-600 bg-teal-100",
  credit: "text-purple-600 bg-purple-100",
}

export function AccountsOverview({ accounts }: AccountsOverviewProps) {
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = () => {
    setRefreshing(true)
    // TODO: Implement account refresh logic
    setTimeout(() => setRefreshing(false), 2000)
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-4">
        <div>
          <CardTitle>Accounts</CardTitle>
          <CardDescription>Manage your connected accounts</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {accounts.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2 bg-transparent"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Sync
            </Button>
          )}
          <PlaidLink size="sm" onSuccess={() => window.location.reload()} />
        </div>
      </CardHeader>
      <CardContent>
        {accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center px-4">
            <div className="rounded-full bg-gray-100 p-4 sm:p-6 mb-4">
              <Wallet className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
            </div>
            <h3 className="font-semibold text-base sm:text-lg mb-2">No accounts yet</h3>
            <p className="text-sm text-gray-600 mb-4 max-w-sm">
              Connect your bank accounts securely with Plaid to start tracking your finances
            </p>
            <PlaidLink onSuccess={() => window.location.reload()} />
          </div>
        ) : (
          <div className="space-y-3">
            {accounts.map((account) => {
              const Icon = accountIcons[account.type] || Wallet
              const colorClass = accountColors[account.type] || "text-gray-600 bg-gray-100"

              return (
                <div
                  key={account.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-lg border bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`rounded-full p-2 sm:p-2.5 ${colorClass} shrink-0`}>
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">{account.name}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="secondary" className="text-xs capitalize">
                          {account.type}
                        </Badge>
                        {account.connected && (
                          <Badge variant="outline" className="text-xs text-teal-600 border-teal-600">
                            Connected
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-base sm:text-lg font-bold sm:text-right">
                    ${Number.parseFloat(account.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
