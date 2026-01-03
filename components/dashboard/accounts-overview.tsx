"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Wallet, PiggyBank, RefreshCw, MoreVertical, Trash2, AlertCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { PlaidLink } from "@/components/integrations/plaid-link"
import { syncPlaidAccounts, disconnectPlaidAccount } from "@/lib/actions/plaid"
import { AddAccountDialog } from "./add-account-dialog"
import type { Database } from "@/types/database"
import { toast } from "sonner"

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
  const [isPending, startTransition] = useTransition()
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    startTransition(async () => {
      const result = await syncPlaidAccounts()
      if (result.error) {
        toast.error(result.error)
      } else if (result.synced > 0) {
        toast.success(`Synced ${result.synced} account(s)`)
        window.location.reload()
      } else {
        toast.info("All accounts are up to date")
      }
      setRefreshing(false)
    })
  }

  const handleDeleteAccount = async () => {
    if (!accountToDelete) return

    setIsDeleting(true)
    const result = await disconnectPlaidAccount(accountToDelete.id)
    setIsDeleting(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Account disconnected successfully")
      window.location.reload()
    }
    setAccountToDelete(null)
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + Number.parseFloat(acc.balance), 0)

  const connectedCount = accounts.filter((a) => a.connected).length
  const disconnectedCount = accounts.filter((a) => !a.connected).length

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              Accounts
              {disconnectedCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {disconnectedCount} needs attention
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {accounts.length > 0
                ? `Total balance: $${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                : "Connect your bank accounts to get started"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {accounts.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing || isPending}
                className="gap-2 bg-transparent"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Sync</span>
              </Button>
            )}
            <AddAccountDialog onSuccess={() => window.location.reload()} />
            <PlaidLink size="sm" onSuccess={() => window.location.reload()} />
          </div>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center px-4">
              <div className="rounded-full bg-muted p-4 sm:p-6 mb-4">
                <Wallet className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-base sm:text-lg mb-2">No accounts yet</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                Connect your bank accounts securely with Plaid to start tracking your finances automatically
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
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className={`rounded-full p-2 sm:p-2.5 ${colorClass} shrink-0`}>
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base truncate">{account.name}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="secondary" className="text-xs capitalize">
                            {account.type}
                          </Badge>
                          {account.connected ? (
                            <Badge variant="outline" className="text-xs text-teal-600 border-teal-600">
                              Connected
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-xs gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Reconnect needed
                            </Badge>
                          )}
                          {account.last_synced_at && (
                            <span className="text-xs text-muted-foreground hidden md:inline">
                              Updated {new Date(account.last_synced_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2">
                      <p className="text-base sm:text-lg font-bold">
                        ${Number.parseFloat(account.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!account.connected && (
                            <DropdownMenuItem asChild>
                              <PlaidLink variant="ghost" size="sm" className="w-full justify-start cursor-pointer">
                                Reconnect Account
                              </PlaidLink>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive cursor-pointer"
                            onClick={() => setAccountToDelete(account)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!accountToDelete} onOpenChange={() => setAccountToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{accountToDelete?.name}"? This will also delete all associated
              transactions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Removing..." : "Remove Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
