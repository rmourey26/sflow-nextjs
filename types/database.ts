export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          phone_number: string | null
          subscription_tier: "free" | "essential" | "pro" | "business"
          trial_ends_at: string | null
          first_trial_granted_at: string | null
          previous_subscription_tier: string | null
          terms_accepted_at: string | null
          terms_version: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          phone_number?: string | null
          subscription_tier?: "free" | "essential" | "pro" | "business"
          trial_ends_at?: string | null
          first_trial_granted_at?: string | null
          previous_subscription_tier?: string | null
          terms_accepted_at?: string | null
          terms_version?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          phone_number?: string | null
          subscription_tier?: "free" | "essential" | "pro" | "business"
          trial_ends_at?: string | null
          first_trial_granted_at?: string | null
          previous_subscription_tier?: string | null
          terms_accepted_at?: string | null
          terms_version?: string | null
          updated_at?: string
        }
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          type: "checking" | "savings" | "credit"
          balance: string
          institution_id: string | null
          connected: boolean
          last_synced_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: "checking" | "savings" | "credit"
          balance: string
          institution_id?: string | null
          connected?: boolean
          last_synced_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          type?: "checking" | "savings" | "credit"
          balance?: string
          institution_id?: string | null
          connected?: boolean
          last_synced_at?: string | null
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          account_id: string
          amount: string
          type: "income" | "expense"
          category: string | null
          description: string
          date: string
          pending: boolean
          merchant_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          account_id: string
          amount: string
          type: "income" | "expense"
          category?: string | null
          description: string
          date: string
          pending?: boolean
          merchant_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          amount?: string
          type?: "income" | "expense"
          category?: string | null
          description?: string
          date?: string
          pending?: boolean
          merchant_name?: string | null
          updated_at?: string
        }
      }
      savings_goals: {
        Row: {
          id: string
          user_id: string
          name: string
          target_amount: string
          current_amount: string
          deadline: string | null
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          target_amount: string
          current_amount?: string
          deadline?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          target_amount?: string
          current_amount?: string
          deadline?: string | null
          completed?: boolean
          updated_at?: string
        }
      }
      forecast_data: {
        Row: {
          id: string
          user_id: string
          forecast_date: string
          projected_balance: number
          projected_income: number
          projected_expenses: number
          confidence_score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          forecast_date: string
          projected_balance: number
          projected_income?: number
          projected_expenses?: number
          confidence_score?: number | null
          created_at?: string
        }
        Update: {
          forecast_date?: string
          projected_balance?: number
          projected_income?: number
          projected_expenses?: number
          confidence_score?: number | null
        }
      }
      forecasts: {
        Row: {
          id: string
          user_id: string
          horizon_days: 90 | 180 | 365
          chart_data: Json
          important_dates: Json | null
          narrative: string | null
          assumptions: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          horizon_days: 90 | 180 | 365
          chart_data: Json
          important_dates?: Json | null
          narrative?: string | null
          assumptions?: Json | null
          created_at?: string
        }
        Update: {
          horizon_days?: 90 | 180 | 365
          chart_data?: Json
          important_dates?: Json | null
          narrative?: string | null
          assumptions?: Json | null
        }
      }
      financial_profiles: {
        Row: {
          id: string
          user_id: string
          overall_score: number
          cash_flow_health: number
          savings_rate: string
          spending_stability: string
          risk_level: "low_stress" | "medium_stress" | "high_stress"
          summary: string | null
          last_computed_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          overall_score: number
          cash_flow_health: number
          savings_rate: string
          spending_stability: string
          risk_level: "low_stress" | "medium_stress" | "high_stress"
          summary?: string | null
          last_computed_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          overall_score?: number
          cash_flow_health?: number
          savings_rate?: string
          spending_stability?: string
          risk_level?: "low_stress" | "medium_stress" | "high_stress"
          summary?: string | null
          last_computed_at?: string
          updated_at?: string
        }
      }
      smart_actions: {
        Row: {
          id: string
          user_id: string
          type: "SAVE" | "SPEND" | "PREPARE" | "SMOOTH" | "RISK_ALERT"
          status: "suggested" | "accepted" | "dismissed"
          title: string
          description: string
          action_amount: string | null
          priority: number
          suggested_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: "SAVE" | "SPEND" | "PREPARE" | "SMOOTH" | "RISK_ALERT"
          status?: "suggested" | "accepted" | "dismissed"
          title: string
          description: string
          action_amount?: string | null
          priority?: number
          suggested_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          type?: "SAVE" | "SPEND" | "PREPARE" | "SMOOTH" | "RISK_ALERT"
          status?: "suggested" | "accepted" | "dismissed"
          title?: string
          description?: string
          action_amount?: string | null
          priority?: number
          suggested_date?: string | null
          updated_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          owner_id: string
          subscription_tier: "business"
          billing_cycle: "monthly" | "yearly"
          seats_total: number
          seats_used: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          owner_id: string
          subscription_tier?: "business"
          billing_cycle: "monthly" | "yearly"
          seats_total?: number
          seats_used?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          billing_cycle?: "monthly" | "yearly"
          seats_total?: number
          seats_used?: number
          updated_at?: string
        }
      }
    }
  }
}
