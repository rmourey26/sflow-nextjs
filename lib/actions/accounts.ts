"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Database } from "@/types/database"

type Account = Database["public"]["Tables"]["accounts"]["Row"]
type AccountInsert = Database["public"]["Tables"]["accounts"]["Insert"]
type AccountUpdate = Database["public"]["Tables"]["accounts"]["Update"]

export async function getAccounts() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching accounts:", error)
    return []
  }
  return (data as Account[]) || []
}

export async function createAccount(account: Omit<AccountInsert, "user_id">) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("accounts")
    .insert({ ...account, user_id: user.id })
    .select()
    .single()

  if (error) throw error

  revalidatePath("/dashboard")
  return data as Account
}

export async function updateAccount(id: string, updates: AccountUpdate) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("accounts")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath("/dashboard")
  return data as Account
}

export async function deleteAccount(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase.from("accounts").delete().eq("id", id).eq("user_id", user.id)

  if (error) throw error

  revalidatePath("/dashboard")
}
