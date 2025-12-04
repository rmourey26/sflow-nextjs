"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Database } from "@/types/database"

type SmartAction = Database["public"]["Tables"]["smart_actions"]["Row"]
type SmartActionInsert = Database["public"]["Tables"]["smart_actions"]["Insert"]
type SmartActionUpdate = Database["public"]["Tables"]["smart_actions"]["Update"]

export async function getSmartActions(status?: "suggested" | "accepted" | "dismissed") {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  let query = supabase
    .from("smart_actions")
    .select("*")
    .eq("user_id", user.id)
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false })

  if (status) {
    query = query.eq("status", status)
  }

  const { data, error } = await query

  if (error) throw error
  return data as SmartAction[]
}

export async function createSmartAction(action: Omit<SmartActionInsert, "user_id">) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("smart_actions")
    .insert({ ...action, user_id: user.id })
    .select()
    .single()

  if (error) throw error

  revalidatePath("/insights")
  return data as SmartAction
}

export async function updateSmartAction(id: string, updates: SmartActionUpdate) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("smart_actions")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath("/insights")
  return data as SmartAction
}

export async function acceptSmartAction(id: string) {
  return updateSmartAction(id, { status: "accepted" })
}

export async function dismissSmartAction(id: string) {
  return updateSmartAction(id, { status: "dismissed" })
}
