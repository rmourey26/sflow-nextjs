"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Database } from "@/types/database"

type Transaction = Database["public"]["Tables"]["transactions"]["Row"]
type TransactionInsert = Database["public"]["Tables"]["transactions"]["Insert"]
type TransactionUpdate = Database["public"]["Tables"]["transactions"]["Update"]

export async function getTransactions(accountId?: string, limit = 50, offset = 0) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  let query = supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("transaction_date", { ascending: false })
    .range(offset, offset + limit - 1)

  if (accountId) {
    query = query.eq("account_id", accountId)
  }

  const { data, error } = await query

  if (error) {
    console.error("[v0] Error fetching transactions:", error)
    return []
  }
  return (data as Transaction[]) || []
}

export async function createTransaction(transaction: TransactionInsert) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // Verify account belongs to user
  const { data: account } = await supabase.from("accounts").select("user_id").eq("id", transaction.account_id).single()

  if (!account || account.user_id !== user.id) {
    throw new Error("Account not found")
  }

  const { data, error } = await supabase.from("transactions").insert(transaction).select().single()

  if (error) throw error

  revalidatePath("/dashboard")
  return data as Transaction
}

export async function updateTransaction(id: string, updates: TransactionUpdate) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("transactions")
    .update(updates)
    .eq("id", id)
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (error) throw error

  revalidatePath("/dashboard")
  return data as Transaction
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase.from("transactions").delete().eq("id", id)

  if (error) throw error

  revalidatePath("/dashboard")
}
