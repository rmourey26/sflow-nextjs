"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { createGoal, deleteGoal, contributeToGoal } from "@/lib/actions/goals"
import type { Database } from "@/types/database"
import { Plus, Target, Trash2, DollarSign, Calendar } from "lucide-react"

type SavingsGoal = Database["public"]["Tables"]["savings_goals"]["Row"]

interface GoalsManagementProps {
  initialGoals: SavingsGoal[]
}

export function GoalsManagement({ initialGoals }: GoalsManagementProps) {
  const [goals, setGoals] = useState<SavingsGoal[]>(initialGoals)
  const [isCreating, setIsCreating] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const [newGoal, setNewGoal] = useState({
    name: "",
    target_amount: "",
    current_amount: "0",
    deadline: "",
  })

  const handleCreateGoal = () => {
    if (!newGoal.name || !newGoal.target_amount) {
      toast({ title: "Please fill in all required fields", variant: "destructive" })
      return
    }

    startTransition(async () => {
      try {
        console.log("[v0] Creating goal with data:", newGoal)
        const goal = await createGoal({
          name: newGoal.name,
          target_amount: newGoal.target_amount,
          current_amount: newGoal.current_amount || "0",
          deadline: newGoal.deadline || null,
        })
        setGoals([goal, ...goals])
        setIsCreating(false)
        setNewGoal({ name: "", target_amount: "", current_amount: "0", deadline: "" })
        toast({ title: "Goal created successfully" })
      } catch (error) {
        console.error("[v0] Error creating goal:", error)
        toast({
          title: "Failed to create goal",
          description: error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        })
      }
    })
  }

  const handleContribute = (goalId: string, amount: number) => {
    startTransition(async () => {
      try {
        const updated = await contributeToGoal(goalId, amount)
        setGoals(goals.map((g) => (g.id === goalId ? updated : g)))
        toast({ title: "Contribution added successfully" })
      } catch (error) {
        toast({ title: "Failed to add contribution", variant: "destructive" })
      }
    })
  }

  const handleDelete = (goalId: string) => {
    startTransition(async () => {
      try {
        await deleteGoal(goalId)
        setGoals(goals.filter((g) => g.id !== goalId))
        toast({ title: "Goal deleted successfully" })
      } catch (error) {
        toast({ title: "Failed to delete goal", variant: "destructive" })
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Savings Goals</h2>
          <p className="text-muted-foreground">Track your financial goals and progress</p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Savings Goal</DialogTitle>
              <DialogDescription>Set a new financial goal to track your progress</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Goal Name *</Label>
                <Input
                  id="name"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  placeholder="Emergency Fund"
                  required
                />
              </div>
              <div>
                <Label htmlFor="target">Target Amount *</Label>
                <Input
                  id="target"
                  type="number"
                  step="0.01"
                  value={newGoal.target_amount}
                  onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                  placeholder="5000.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="current">Current Amount</Label>
                <Input
                  id="current"
                  type="number"
                  step="0.01"
                  value={newGoal.current_amount}
                  onChange={(e) => setNewGoal({ ...newGoal, current_amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="deadline">Deadline (Optional)</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateGoal} disabled={isPending || !newGoal.name || !newGoal.target_amount}>
                Create Goal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => {
          const progress = (Number.parseFloat(goal.current_amount) / Number.parseFloat(goal.target_amount)) * 100
          const remaining = Number.parseFloat(goal.target_amount) - Number.parseFloat(goal.current_amount)

          return (
            <Card key={goal.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-semibold">{goal.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 text-sm">
                    <Target className="h-3 w-3" />${Number.parseFloat(goal.target_amount).toLocaleString()}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(goal.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold">{Math.min(progress, 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={Math.min(progress, 100)} className="h-2" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Current</span>
                    <span className="font-medium">${Number.parseFloat(goal.current_amount).toLocaleString()}</span>
                  </div>
                  {!goal.completed && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Remaining</span>
                      <span className="font-medium">${remaining.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {goal.deadline && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Due {new Date(goal.deadline).toLocaleDateString()}</span>
                  </div>
                )}

                {!goal.completed && (
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      const amount = prompt("Enter contribution amount:")
                      if (amount && !isNaN(Number.parseFloat(amount))) {
                        handleContribute(goal.id, Number.parseFloat(amount))
                      }
                    }}
                  >
                    <DollarSign className="mr-2 h-4 w-4" />
                    Add Contribution
                  </Button>
                )}

                {goal.completed && (
                  <div className="rounded-lg bg-green-500/10 p-3 text-center text-sm font-medium text-green-600 dark:text-green-400">
                    Goal Completed! 🎉
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {goals.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No goals yet</h3>
            <p className="mb-4 text-center text-sm text-muted-foreground">
              Create your first savings goal to start tracking your progress
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Goal
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
