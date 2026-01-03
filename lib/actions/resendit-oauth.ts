"use server"

import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { generateCodeVerifier, generateCodeChallenge } from "@/lib/resendit/client"

const RESENDIT_BASE_URL = process.env.RESENDIT_BASE_URL || "https://app.resend-it.com"
const CLIENT_ID = process.env.RESENDIT_CLIENT_ID!
const CLIENT_SECRET = process.env.RESENDIT_CLIENT_SECRET!
const REDIRECT_URI = process.env.NEXT_PUBLIC_URL + "/api/resendit/callback"

export async function initiateResendItOAuth() {
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = generateCodeChallenge(codeVerifier)
  const state = crypto.randomUUID()

  const cookieStore = await cookies()

  // Store PKCE parameters in HTTP-only cookies
  cookieStore.set("resendit_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
  })

  cookieStore.set("resendit_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
  })

  const authUrl = new URL(`${RESENDIT_BASE_URL}/oauth/authorize`)
  authUrl.searchParams.set("response_type", "code")
  authUrl.searchParams.set("client_id", CLIENT_ID)
  authUrl.searchParams.set("redirect_uri", REDIRECT_URI)
  authUrl.searchParams.set("scope", "execute_agents execute_workflows read_assets write_assets read_analytics")
  authUrl.searchParams.set("state", state)
  authUrl.searchParams.set("code_challenge", codeChallenge)
  authUrl.searchParams.set("code_challenge_method", "S256")

  redirect(authUrl.toString())
}

export async function exchangeCodeForTokens(code: string, state: string) {
  const cookieStore = await cookies()
  const storedState = cookieStore.get("resendit_oauth_state")?.value
  const codeVerifier = cookieStore.get("resendit_code_verifier")?.value

  if (!storedState || state !== storedState) {
    throw new Error("State mismatch - possible CSRF attack")
  }

  if (!codeVerifier) {
    throw new Error("Code verifier not found")
  }

  const response = await fetch(`${RESENDIT_BASE_URL}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Token exchange failed")
  }

  const tokens = await response.json()

  // Store tokens in HTTP-only cookies
  cookieStore.set("resendit_access_token", tokens.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: tokens.expires_in,
  })

  cookieStore.set("resendit_refresh_token", tokens.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  })

  // Clean up temporary cookies
  cookieStore.delete("resendit_code_verifier")
  cookieStore.delete("resendit_oauth_state")

  return tokens
}

export async function getResendItTokens() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("resendit_access_token")?.value
  const refreshToken = cookieStore.get("resendit_refresh_token")?.value

  if (!accessToken || !refreshToken) {
    return null
  }

  return { accessToken, refreshToken }
}

export async function disconnectResendIt() {
  const cookieStore = await cookies()
  cookieStore.delete("resendit_access_token")
  cookieStore.delete("resendit_refresh_token")
}
