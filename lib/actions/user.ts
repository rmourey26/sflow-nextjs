"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Database } from "@/types/database"

type User = Database["public"]["Tables"]["users"]["Row"]
type UserUpdate = Database["public"]["Tables"]["users"]["Update"]

export async function getCurrentUser() {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()
  if (!authUser) return null

  const { data, error } = await supabase.from("users").select("*").eq("id", authUser.id).single()

  if (error) throw error
  return data as User
}

export async function updateUserProfile(updates: UserUpdate) {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()
  if (!authUser) throw new Error("Not authenticated")

  const { data, error } = await supabase.from("users").update(updates).eq("id", authUser.id).select().single()

  if (error) throw error

  revalidatePath("/settings")
  return data as User
}

export async function exportUserData() {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()
  if (!authUser) throw new Error("Not authenticated")

  const [user, accounts, transactions, goals] = await Promise.all([
    supabase.from("users").select("*").eq("id", authUser.id).single(),
    supabase.from("accounts").select("*").eq("user_id", authUser.id),
    supabase.from("transactions").select("*, accounts!inner(user_id)").eq("accounts.user_id", authUser.id),
    supabase.from("savings_goals").select("*").eq("user_id", authUser.id),
  ])

  return {
    user: user.data,
    accounts: accounts.data,
    transactions: transactions.data,
    goals: goals.data,
  }
}

export async function deleteUserAccount() {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()
  if (!authUser) throw new Error("Not authenticated")

  // Delete user from public.users (cascade will handle related records)
  const { error: deleteError } = await supabase.from("users").delete().eq("id", authUser.id)

  if (deleteError) throw deleteError

  // Sign out
  await supabase.auth.signOut()

  revalidatePath("/")
}
