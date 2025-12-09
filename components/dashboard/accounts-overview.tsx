"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, CreditCard, Wallet, PiggyBank } from "lucide-react"
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
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Accounts</CardTitle>
          <CardDescription>Manage your connected accounts</CardDescription>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Account
        </Button>
      </CardHeader>
      <CardContent>
        {accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-gray-100 p-6 mb-4">
              <Wallet className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No accounts yet</h3>
            <p className="text-sm text-gray-600 mb-4 max-w-sm">
              Connect your bank accounts to start tracking your finances
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Account
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {accounts.map((account) => {
              const Icon = accountIcons[account.type] || Wallet
              const colorClass = accountColors[account.type] || "text-gray-600 bg-gray-100"

              return (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className={`rounded-full p-2.5 ${colorClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{account.name}</p>
                      <div className="flex items-center gap-2 mt-1">
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
                  <p className="text-lg font-bold">
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
