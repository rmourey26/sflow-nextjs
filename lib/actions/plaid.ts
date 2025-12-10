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

    // Exchange public token for access token
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

    // Store each account in the database
    for (const account of accounts) {
      await createAccount({
        account_type: account.type === "credit" ? "credit_card" : account.subtype || "checking",
        account_name: account.name,
        balance: account.balances.current || 0,
        currency: account.balances.iso_currency_code || "USD",
        institution_name: metadata.institution?.name || "Unknown",
        account_number_last4: account.mask,
        plaid_account_id: account.account_id,
        plaid_access_token: accessToken,
        plaid_item_id: itemId,
      })
    }

    return { success: true, accounts: accounts.length, error: null }
  } catch (error) {
    console.error("[v0] Error exchanging public token:", error)
    return { success: false, accounts: 0, error: "Failed to connect account" }
  }
}
