import { createClient as createServerClient } from "@/lib/supabase/server"
import { createClient as createBrowserClient } from "@/lib/supabase/client"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

// Query keys factory for consistent cache management
export const queryKeys = {
  user: {
    current: ["user", "current"] as const,
    profile: (userId: string) => ["user", "profile", userId] as const,
  },
  accounts: {
    all: ["accounts"] as const,
    detail: (id: string) => ["accounts", id] as const,
  },
  transactions: {
    all: (accountId?: string, limit?: number) => ["transactions", { accountId, limit }] as const,
    detail: (id: string) => ["transactions", id] as const,
  },
  goals: {
    all: ["goals"] as const,
    detail: (id: string) => ["goals", id] as const,
  },
  forecast: {
    data: (days: number) => ["forecast", days] as const,
  },
  smartActions: {
    all: (status?: string) => ["smart-actions", { status }] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    unread: ["notifications", "unread"] as const,
  },
  settings: {
    all: ["settings"] as const,
  },
}

// Server-side data fetchers for initial hydration
export async function prefetchUser() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase.from("users").select("*").eq("id", user.id).single()
  return data
}

export async function prefetchAccounts() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
  return data || []
}

export async function prefetchTransactions(limit = 10) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from("transactions")
    .select("*, accounts!inner(user_id)")
    .eq("accounts.user_id", user.id)
    .order("date", { ascending: false })
    .limit(limit)

  return data || []
}

// Client-side query functions
export function getSupabaseClient(): SupabaseClient<Database> {
  return createBrowserClient()
}
