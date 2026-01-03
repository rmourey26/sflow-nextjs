"use server"

import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from "plaid"
import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Database } from "@/types/database"

type Transaction = Database["public"]["Tables"]["transactions"]["Insert"]

const getPlaidClient = () => {
  const clientId = process.env.PLAID_CLIENT_ID
  const secret = process.env.PLAID_SECRET
  const env = (process.env.PLAID_ENV || "sandbox") as keyof typeof PlaidEnvironments

  if (!clientId || !secret) {
    console.error("[v0] Plaid credentials not configured")
    return null
  }

  const configuration = new Configuration({
    basePath: PlaidEnvironments[env],
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": clientId,
        "PLAID-SECRET": secret,
      },
    },
  })

  return new PlaidApi(configuration)
}

export async function createLinkToken() {
  try {
    const plaidClient = getPlaidClient()
    if (!plaidClient) {
      return {
        linkToken: null,
        error: "Plaid is not configured. Please add PLAID_CLIENT_ID and PLAID_SECRET to your environment variables.",
      }
    }

    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { linkToken: null, error: "Please sign in to connect your bank account" }
    }

    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: user.id,
      },
      client_name: "SaverFlow",
      products: [Products.Transactions, Products.Auth],
      country_codes: [CountryCode.Us],
      language: "en",
      webhook: process.env.PLAID_WEBHOOK_URL || undefined,
    })

    return { linkToken: response.data.link_token, error: null }
  } catch (error: any) {
    console.error("[v0] Error creating link token:", error?.response?.data || error)
    const message = error?.response?.data?.error_message || "Failed to initialize bank connection"
    return { linkToken: null, error: message }
  }
}

export async function exchangePublicToken(publicToken: string, metadata: any) {
  try {
    const plaidClient = getPlaidClient()
    if (!plaidClient) {
      return { success: false, accounts: 0, error: "Plaid is not configured" }
    }

    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, accounts: 0, error: "Not authenticated" }
    }

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    })

    const accessToken = exchangeResponse.data.access_token
    const itemId = exchangeResponse.data.item_id

    // Get account information from Plaid
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    })

    const plaidAccounts = accountsResponse.data.accounts
    const institution = metadata?.institution

    // Map Plaid account types to our types
    const accountTypeMapping: Record<string, "checking" | "savings" | "credit"> = {
      depository: "checking",
      credit: "credit",
      loan: "credit",
      investment: "savings",
      brokerage: "savings",
      other: "checking",
    }

    // Map Plaid subtypes for more accurate categorization
    const subtypeMapping: Record<string, "checking" | "savings" | "credit"> = {
      checking: "checking",
      savings: "savings",
      "money market": "savings",
      cd: "savings",
      "credit card": "credit",
      paypal: "checking",
      prepaid: "checking",
    }

    let successCount = 0
    const errors: string[] = []

    for (const plaidAccount of plaidAccounts) {
      try {
        // Determine account type
        const subtype = plaidAccount.subtype?.toLowerCase()
        const type = plaidAccount.type?.toLowerCase()
        const accountType = subtypeMapping[subtype || ""] || accountTypeMapping[type || ""] || "checking"

        // Create account in Supabase
        const { error: insertError } = await supabase.from("accounts").insert({
          user_id: user.id,
          name: plaidAccount.name || `${institution?.name || "Bank"} Account`,
          type: accountType,
          balance: (plaidAccount.balances.current || 0).toString(),
          institution_id: institution?.institution_id || null,
          connected: true,
          plaid_account_id: plaidAccount.account_id,
          plaid_access_token: accessToken,
          plaid_item_id: itemId,
          last_synced_at: new Date().toISOString(),
        })

        if (insertError) {
          console.error("[v0] Error inserting account:", insertError)
          errors.push(`Failed to save ${plaidAccount.name}`)
        } else {
          successCount++
        }
      } catch (err: any) {
        console.error("[v0] Error processing account:", plaidAccount.name, err)
        errors.push(`Error with ${plaidAccount.name}`)
      }
    }

    // Sync initial transactions
    if (successCount > 0) {
      await syncTransactionsForItem(accessToken, itemId, user.id)
    }

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/accounts")

    if (successCount === 0) {
      return { success: false, accounts: 0, error: errors.join(", ") || "Failed to connect accounts" }
    }

    return {
      success: true,
      accounts: successCount,
      error: errors.length > 0 ? `Connected ${successCount} accounts with some errors` : null,
    }
  } catch (error: any) {
    console.error("[v0] Error exchanging public token:", error?.response?.data || error)
    const message = error?.response?.data?.error_message || "Failed to connect bank account"
    return { success: false, accounts: 0, error: message }
  }
}

async function syncTransactionsForItem(accessToken: string, itemId: string, userId: string) {
  try {
    const plaidClient = getPlaidClient()
    if (!plaidClient) return

    const supabase = await createServerClient()

    // Get accounts for this item
    const { data: accounts } = await supabase
      .from("accounts")
      .select("id, plaid_account_id")
      .eq("user_id", userId)
      .eq("plaid_item_id", itemId)

    if (!accounts || accounts.length === 0) return

    // Create account ID map
    const accountIdMap = new Map(accounts.map((a) => [a.plaid_account_id, a.id]))

    // Get transactions from last 30 days
    const endDate = new Date().toISOString().split("T")[0]
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

    const transactionsResponse = await plaidClient.transactionsGet({
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate,
      options: {
        count: 100,
        offset: 0,
      },
    })

    const plaidTransactions = transactionsResponse.data.transactions

    for (const txn of plaidTransactions) {
      const accountId = accountIdMap.get(txn.account_id)
      if (!accountId) continue

      // Check if transaction already exists
      const { data: existing } = await supabase
        .from("transactions")
        .select("id")
        .eq("account_id", accountId)
        .eq("description", txn.name || "Transaction")
        .eq("date", txn.date)
        .eq("amount", Math.abs(txn.amount).toString())
        .single()

      if (existing) continue

      // Insert new transaction
      await supabase.from("transactions").insert({
        account_id: accountId,
        amount: Math.abs(txn.amount).toString(),
        type: txn.amount < 0 ? "expense" : "income",
        category: txn.category?.[0] || null,
        description: txn.name || "Transaction",
        date: txn.date,
        pending: txn.pending,
        merchant_name: txn.merchant_name || null,
      })
    }
  } catch (error) {
    console.error("[v0] Error syncing transactions:", error)
  }
}

export async function syncPlaidAccounts() {
  try {
    const plaidClient = getPlaidClient()
    if (!plaidClient) {
      return { success: false, synced: 0, error: "Plaid is not configured" }
    }

    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, synced: 0, error: "Not authenticated" }
    }

    // Get all Plaid-connected accounts for this user
    const { data: accounts } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", user.id)
      .not("plaid_access_token", "is", null)

    if (!accounts || accounts.length === 0) {
      return { success: true, synced: 0, error: null }
    }

    // Group accounts by item_id to minimize API calls
    const itemMap = new Map<string, typeof accounts>()
    for (const account of accounts) {
      if (!account.plaid_item_id || !account.plaid_access_token) continue
      const existing = itemMap.get(account.plaid_item_id) || []
      existing.push(account)
      itemMap.set(account.plaid_item_id, existing)
    }

    let syncedCount = 0
    const errors: string[] = []

    for (const [itemId, itemAccounts] of itemMap) {
      const accessToken = itemAccounts[0].plaid_access_token!

      try {
        // Get fresh balances from Plaid
        const balanceResponse = await plaidClient.accountsBalanceGet({
          access_token: accessToken,
        })

        for (const account of itemAccounts) {
          const plaidAccount = balanceResponse.data.accounts.find((a) => a.account_id === account.plaid_account_id)

          if (plaidAccount) {
            await supabase
              .from("accounts")
              .update({
                balance: (plaidAccount.balances.current || 0).toString(),
                last_synced_at: new Date().toISOString(),
              })
              .eq("id", account.id)

            syncedCount++
          }
        }

        // Sync transactions for this item
        await syncTransactionsForItem(accessToken, itemId, user.id)
      } catch (err: any) {
        console.error("[v0] Error syncing item:", itemId, err)

        // Handle specific Plaid errors
        if (err?.response?.data?.error_code === "ITEM_LOGIN_REQUIRED") {
          errors.push("Re-authentication required for some accounts")
          // Mark accounts as disconnected
          for (const account of itemAccounts) {
            await supabase.from("accounts").update({ connected: false }).eq("id", account.id)
          }
        } else {
          errors.push(`Failed to sync some accounts`)
        }
      }
    }

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/accounts")

    return {
      success: true,
      synced: syncedCount,
      error: errors.length > 0 ? errors.join("; ") : null,
    }
  } catch (error: any) {
    console.error("[v0] Error syncing Plaid accounts:", error)
    return { success: false, synced: 0, error: "Failed to sync accounts" }
  }
}

export async function disconnectPlaidAccount(accountId: string) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Get the account
    const { data: account } = await supabase
      .from("accounts")
      .select("*")
      .eq("id", accountId)
      .eq("user_id", user.id)
      .single()

    if (!account) {
      return { success: false, error: "Account not found" }
    }

    // Remove Plaid access if this is the last account for the item
    if (account.plaid_item_id && account.plaid_access_token) {
      const { data: otherAccounts } = await supabase
        .from("accounts")
        .select("id")
        .eq("user_id", user.id)
        .eq("plaid_item_id", account.plaid_item_id)
        .neq("id", accountId)

      // If no other accounts use this item, remove the Plaid item
      if (!otherAccounts || otherAccounts.length === 0) {
        const plaidClient = getPlaidClient()
        if (plaidClient) {
          try {
            await plaidClient.itemRemove({
              access_token: account.plaid_access_token,
            })
          } catch (err) {
            console.error("[v0] Error removing Plaid item:", err)
          }
        }
      }
    }

    // Delete the account
    const { error } = await supabase.from("accounts").delete().eq("id", accountId).eq("user_id", user.id)

    if (error) throw error

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/accounts")

    return { success: true, error: null }
  } catch (error: any) {
    console.error("[v0] Error disconnecting account:", error)
    return { success: false, error: "Failed to disconnect account" }
  }
}

export async function handlePlaidWebhook(webhookType: string, itemId: string, payload: any) {
  try {
    const supabase = await createServerClient()

    // Find accounts associated with this item
    const { data: accounts } = await supabase
      .from("accounts")
      .select("user_id, plaid_access_token")
      .eq("plaid_item_id", itemId)
      .limit(1)
      .single()

    if (!accounts) return { success: false, error: "Item not found" }

    switch (webhookType) {
      case "TRANSACTIONS":
        // Sync new transactions
        if (accounts.plaid_access_token) {
          await syncTransactionsForItem(accounts.plaid_access_token, itemId, accounts.user_id)
        }
        break

      case "ITEM":
        if (payload.error?.error_code === "ITEM_LOGIN_REQUIRED") {
          // Mark accounts as needing re-authentication
          await supabase.from("accounts").update({ connected: false }).eq("plaid_item_id", itemId)
        }
        break

      default:
        console.log("[v0] Unhandled webhook type:", webhookType)
    }

    return { success: true, error: null }
  } catch (error) {
    console.error("[v0] Error handling webhook:", error)
    return { success: false, error: "Webhook processing failed" }
  }
}
