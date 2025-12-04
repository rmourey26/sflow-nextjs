"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Database } from "@/types/database"

type Forecast = Database["public"]["Tables"]["forecasts"]["Row"]
type ForecastInsert = Database["public"]["Tables"]["forecasts"]["Insert"]

export async function getForecast(horizonDays: 90 | 180 | 365) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("forecasts")
    .select("*")
    .eq("user_id", user.id)
    .eq("horizon_days", horizonDays)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== "PGRST116") throw error
  return data as Forecast | null
}

export async function getAllForecasts() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const [forecast90, forecast180, forecast365] = await Promise.all([
    getForecast(90),
    getForecast(180),
    getForecast(365),
  ])

  return {
    90: forecast90,
    180: forecast180,
    365: forecast365,
  }
}

export async function createForecast(forecast: Omit<ForecastInsert, "user_id">) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("forecasts")
    .insert({ ...forecast, user_id: user.id })
    .select()
    .single()

  if (error) throw error

  revalidatePath("/dashboard")
  return data as Forecast
}
