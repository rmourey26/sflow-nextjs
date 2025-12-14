import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import Link from "next/link"
import type { Database } from "@/types/database"

type Transaction = Database["public"]["Tables"]["transactions"]["Row"]

interface RecentTransactionsProps {
  transactions: Transaction[]
  showAll?: boolean // Added showAll prop to control whether to display all transactions or limit to 5
}

export function RecentTransactions({ transactions, showAll = false }: RecentTransactionsProps) {
  const displayTransactions = showAll ? transactions : transactions.slice(0, 5)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest financial activity</CardDescription>
        </div>
        {!showAll && (
          <Link href="/dashboard/accounts">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        )}
      </CardHeader>
      <CardContent>
        {displayTransactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-600">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayTransactions.map((transaction) => {
              const isIncome = transaction.type === "income"
              const Icon = isIncome ? ArrowUpRight : ArrowDownRight

              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full p-2 ${isIncome ? "bg-teal-100" : "bg-orange-100"}`}>
                      <Icon className={`h-4 w-4 ${isIncome ? "text-teal-600" : "text-orange-600"}`} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{transaction.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                        {transaction.category && (
                          <Badge variant="outline" className="text-xs">
                            {transaction.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className={`font-semibold ${isIncome ? "text-teal-600" : "text-gray-900"}`}>
                    {isIncome ? "+" : "-"}$
                    {Number.parseFloat(transaction.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
