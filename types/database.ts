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
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
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
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
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
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
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
          plaid_account_id: string | null
          plaid_access_token: string | null
          plaid_item_id: string | null
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
          plaid_account_id?: string | null
          plaid_access_token?: string | null
          plaid_item_id?: string | null
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
          plaid_account_id?: string | null
          plaid_access_token?: string | null
          plaid_item_id?: string | null
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
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: "info" | "success" | "warning" | "error" | "action"
          read: boolean
          action_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: "info" | "success" | "warning" | "error" | "action"
          read?: boolean
          action_url?: string | null
          created_at?: string
        }
        Update: {
          title?: string
          message?: string
          type?: "info" | "success" | "warning" | "error" | "action"
          read?: boolean
          action_url?: string | null
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          email_notifications: boolean
          push_notifications: boolean
          sms_notifications: boolean
          marketing_emails: boolean
          weekly_summary: boolean
          goal_reminders: boolean
          transaction_alerts: boolean
          budget_alerts: boolean
          theme: "light" | "dark" | "system"
          currency: string
          date_format: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email_notifications?: boolean
          push_notifications?: boolean
          sms_notifications?: boolean
          marketing_emails?: boolean
          weekly_summary?: boolean
          goal_reminders?: boolean
          transaction_alerts?: boolean
          budget_alerts?: boolean
          theme?: "light" | "dark" | "system"
          currency?: string
          date_format?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          email_notifications?: boolean
          push_notifications?: boolean
          sms_notifications?: boolean
          marketing_emails?: boolean
          weekly_summary?: boolean
          goal_reminders?: boolean
          transaction_alerts?: boolean
          budget_alerts?: boolean
          theme?: "light" | "dark" | "system"
          currency?: string
          date_format?: string
          updated_at?: string
        }
      }
    }
  }
}
