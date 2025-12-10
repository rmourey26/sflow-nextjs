"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Database } from "@/types/database"

type ForecastDataPoint = Database["public"]["Tables"]["forecast_data"]["Row"]

export async function getForecast(horizonDays: 90 | 180 | 365 = 90) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from("forecast_data")
    .select("*")
    .eq("user_id", user.id)
    .order("forecast_date", { ascending: true })
    .limit(horizonDays)

  if (error) {
    console.error("[v0] Error fetching forecast:", error)
    return null
  }
  return data || null
}

export async function getAllForecasts() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { 90: null, 180: null, 365: null }

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

export async function createForecastData(forecastData: Omit<ForecastDataPoint, "id" | "user_id" | "created_at">) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from("forecast_data")
    .insert({ ...forecastData, user_id: user.id })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating forecast data:", error)
    return null
  }

  revalidatePath("/dashboard")
  return data
}
