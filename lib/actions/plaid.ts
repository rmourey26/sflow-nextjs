"use server"

import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from "plaid"
import { createServerClient } from "@/lib/supabase/server"
import { createAccount } from "./accounts"

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || "sandbox"],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID!,
      "PLAID-SECRET": process.env.PLAID_SECRET!,
    },
  },
})

const plaidClient = new PlaidApi(configuration)

export async function createLinkToken() {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: user.id,
      },
      client_name: "SaverFlow",
      products: [Products.Transactions, Products.Auth],
      country_codes: [CountryCode.Us],
      language: "en",
    })

    return { linkToken: response.data.link_token, error: null }
  } catch (error) {
    console.error("[v0] Error creating link token:", error)
    return { linkToken: null, error: "Failed to create link token" }
  }
}

export async function exchangePublicToken(publicToken: string, metadata: any) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    })

    const accessToken = exchangeResponse.data.access_token
    const itemId = exchangeResponse.data.item_id

    // Get account information
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    })

    const accounts = accountsResponse.data.accounts

    const accountTypeMapping: Record<string, "checking" | "savings" | "credit"> = {
      depository: "checking",
      credit: "credit",
      loan: "credit",
      investment: "savings",
    }

    let successCount = 0
    for (const account of accounts) {
      try {
        const accountType = accountTypeMapping[account.type] || "checking"

        await createAccount({
          name: account.name,
          type: accountType,
          balance: (account.balances.current || 0).toString(),
          institution_id: metadata.institution?.institution_id || null,
          connected: true,
          plaid_account_id: account.account_id,
          plaid_access_token: accessToken,
          plaid_item_id: itemId,
          last_synced_at: new Date().toISOString(),
        })
        successCount++
      } catch (err) {
        console.error("[v0] Error creating account:", account.name, err)
      }
    }

    return { success: true, accounts: successCount, error: null }
  } catch (error) {
    console.error("[v0] Error exchanging public token:", error)
    return { success: false, accounts: 0, error: "Failed to connect account" }
  }
}

export async function syncPlaidAccounts() {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
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

    let syncedCount = 0
    for (const account of accounts) {
      try {
        if (!account.plaid_access_token) continue

        // Get fresh balance from Plaid
        const balanceResponse = await plaidClient.accountsBalanceGet({
          access_token: account.plaid_access_token,
        })

        const plaidAccount = balanceResponse.data.accounts.find((a) => a.account_id === account.plaid_account_id)

        if (plaidAccount) {
          // Update balance in database
          await supabase
            .from("accounts")
            .update({
              balance: (plaidAccount.balances.current || 0).toString(),
              last_synced_at: new Date().toISOString(),
            })
            .eq("id", account.id)

          syncedCount++
        }
      } catch (err) {
        console.error("[v0] Error syncing account:", account.name, err)
      }
    }

    return { success: true, synced: syncedCount, error: null }
  } catch (error) {
    console.error("[v0] Error syncing Plaid accounts:", error)
    return { success: false, synced: 0, error: "Failed to sync accounts" }
  }
}
