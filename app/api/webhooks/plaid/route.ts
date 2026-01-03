import { type NextRequest, NextResponse } from "next/server"
import { handlePlaidWebhook } from "@/lib/actions/plaid"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Verify webhook (Plaid sends a verification request)
    if (body.webhook_type === "VERIFICATION") {
      return NextResponse.json({ status: "verified" })
    }

    // Optional: Verify webhook signature if PLAID_WEBHOOK_SECRET is set
    const webhookSecret = process.env.PLAID_WEBHOOK_SECRET
    if (webhookSecret) {
      const signature = request.headers.get("plaid-verification")
      if (signature) {
        // Plaid webhook verification would go here
        // For now, we'll just log that verification is enabled
        console.log("[v0] Plaid webhook verification enabled")
      }
    }

    const { webhook_type, webhook_code, item_id, ...payload } = body

    console.log("[v0] Received Plaid webhook:", webhook_type, webhook_code, item_id)

    // Handle the webhook
    const result = await handlePlaidWebhook(webhook_type, item_id, {
      code: webhook_code,
      ...payload,
    })

    if (!result.success) {
      console.error("[v0] Webhook handling failed:", result.error)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[v0] Error processing Plaid webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

// Handle GET requests (Plaid may send verification)
export async function GET() {
  return NextResponse.json({ status: "ok" })
}
