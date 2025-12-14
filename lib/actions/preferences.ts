"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Database } from "@/types/database"

type UserPreferences = Database["public"]["Tables"]["user_preferences"]["Row"]
type UserPreferencesUpdate = Database["public"]["Tables"]["user_preferences"]["Update"]

export async function getUserPreferences() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase.from("user_preferences").select("*").eq("user_id", user.id).single()

  if (error) {
    // If no preferences exist, create default ones
    if (error.code === "PGRST116") {
      const { data: newPrefs, error: insertError } = await supabase
        .from("user_preferences")
        .insert({ user_id: user.id })
        .select()
        .single()

      if (insertError) {
        console.error("[v0] Error creating preferences:", insertError)
        return null
      }
      return newPrefs as UserPreferences
    }
    console.error("[v0] Error fetching preferences:", error)
    return null
  }
  return data as UserPreferences
}

export async function updateUserPreferences(updates: UserPreferencesUpdate) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("user_preferences")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath("/dashboard/settings")
  return data as UserPreferences
}
