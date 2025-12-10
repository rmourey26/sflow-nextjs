"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Database } from "@/types/database"

type SavingsGoal = Database["public"]["Tables"]["savings_goals"]["Row"]
type SavingsGoalInsert = Database["public"]["Tables"]["savings_goals"]["Insert"]
type SavingsGoalUpdate = Database["public"]["Tables"]["savings_goals"]["Update"]

export async function getGoals() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("savings_goals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching goals:", error)
    return []
  }
  return (data as SavingsGoal[]) || []
}

export async function createGoal(goal: Omit<SavingsGoalInsert, "user_id">) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("savings_goals")
    .insert({ ...goal, user_id: user.id })
    .select()
    .single()

  if (error) throw error

  revalidatePath("/goals")
  return data as SavingsGoal
}

export async function updateGoal(id: string, updates: SavingsGoalUpdate) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("savings_goals")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath("/goals")
  return data as SavingsGoal
}

export async function contributeToGoal(id: string, amount: number) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // Get current goal
  const { data: goal, error: fetchError } = await supabase
    .from("savings_goals")
    .select("current_amount, target_amount")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (fetchError) throw fetchError

  const newAmount = Number.parseFloat(goal.current_amount) + amount
  const completed = newAmount >= Number.parseFloat(goal.target_amount)

  const { data, error } = await supabase
    .from("savings_goals")
    .update({
      current_amount: newAmount.toFixed(2),
      completed,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath("/goals")
  return data as SavingsGoal
}

export async function deleteGoal(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase.from("savings_goals").delete().eq("id", id).eq("user_id", user.id)

  if (error) throw error

  revalidatePath("/goals")
}
