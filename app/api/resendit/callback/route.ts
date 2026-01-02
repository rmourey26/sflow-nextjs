import { type NextRequest, NextResponse } from "next/server"
import { exchangeCodeForTokens } from "@/lib/actions/resendit-oauth"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  if (error) {
    console.error("[Resend-It] OAuth error:", error)
    return NextResponse.redirect(new URL(`/dashboard/settings?error=${encodeURIComponent(error)}`, request.url))
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/dashboard/settings?error=missing_parameters", request.url))
  }

  try {
    await exchangeCodeForTokens(code, state)
    return NextResponse.redirect(new URL("/dashboard/settings?resendit=connected", request.url))
  } catch (error) {
    console.error("[Resend-It] Token exchange error:", error)
    return NextResponse.redirect(new URL(`/dashboard/settings?error=auth_failed`, request.url))
  }
}
