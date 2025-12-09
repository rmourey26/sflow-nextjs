"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Plus, Target } from "lucide-react"
import type { Database } from "@/types/database"

type SavingsGoal = Database["public"]["Tables"]["savings_goals"]["Row"]

interface SavingsGoalsWidgetProps {
  goals: SavingsGoal[]
}

export function SavingsGoalsWidget({ goals }: SavingsGoalsWidgetProps) {
  const activeGoals = goals.filter((g) => !g.completed)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Savings Goals</CardTitle>
          <CardDescription>{activeGoals.length} active</CardDescription>
        </div>
        <Button size="sm" variant="ghost">
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {activeGoals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-purple-100 p-4 mb-3">
              <Target className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-sm font-medium mb-1">No active goals</p>
            <p className="text-xs text-gray-600 mb-4">Set your first savings goal</p>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Goal
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {activeGoals.slice(0, 3).map((goal) => {
              const current = Number.parseFloat(goal.current_amount)
              const target = Number.parseFloat(goal.target_amount)
              const progress = (current / target) * 100
              const remaining = target - current

              return (
                <div key={goal.id} className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{goal.name}</p>
                      <p className="text-xs text-gray-600">
                        ${current.toLocaleString()} of ${target.toLocaleString()}
                      </p>
                    </div>
                    <p className="text-xs font-medium text-purple-600">{progress.toFixed(0)}%</p>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-gray-500">${remaining.toLocaleString()} remaining</p>
                </div>
              )
            })}
            {activeGoals.length > 3 && (
              <Button variant="ghost" size="sm" className="w-full">
                View All Goals
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
