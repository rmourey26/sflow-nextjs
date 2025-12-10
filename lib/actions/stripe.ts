"use server"

import { stripe } from "@/lib/stripe"
import { PRODUCTS } from "@/lib/products"
import { createServerClient } from "@/lib/supabase/server"

export async function startCheckoutSession(productId: string) {
  try {
    const product = PRODUCTS.find((p) => p.id === productId)
    if (!product) {
      throw new Error(`Product with id "${productId}" not found`)
    }

    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    // Create or get Stripe customer
    const { data: userData } = await supabase.from("users").select("stripe_customer_id").eq("id", user.id).single()

    let customerId = userData?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id

      // Store customer ID
      await supabase.from("users").update({ stripe_customer_id: customerId }).eq("id", user.id)
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: product.priceInCents,
            recurring: product.priceInCents > 0 ? { interval: "month" } : undefined,
          },
          quantity: 1,
        },
      ],
      mode: product.priceInCents > 0 ? "subscription" : "payment",
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}`,
    })

    return { clientSecret: session.client_secret, error: null }
  } catch (error) {
    console.error("[v0] Error creating checkout session:", error)
    return { clientSecret: null, error: "Failed to start checkout" }
  }
}

export async function getSubscriptionStatus() {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { subscription: null, error: "Not authenticated" }
    }

    const { data: userData } = await supabase.from("users").select("stripe_customer_id").eq("id", user.id).single()

    if (!userData?.stripe_customer_id) {
      return { subscription: null, error: null }
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: userData.stripe_customer_id,
      status: "active",
      limit: 1,
    })

    return { subscription: subscriptions.data[0] || null, error: null }
  } catch (error) {
    console.error("[v0] Error fetching subscription:", error)
    return { subscription: null, error: "Failed to fetch subscription" }
  }
}
