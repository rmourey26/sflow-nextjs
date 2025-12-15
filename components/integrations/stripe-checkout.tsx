"use client"

import { useState, useCallback } from "react"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { startCheckoutSession } from "@/lib/actions/stripe"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface StripeCheckoutProps {
  tier: string
}

const TIER_TO_PRODUCT_ID: Record<string, string> = {
  free: "basic",
  essential: "pro",
  pro: "premium",
}

export function StripeCheckout({ tier }: StripeCheckoutProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const productId = TIER_TO_PRODUCT_ID[tier] || "basic"

  const fetchClientSecret = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await startCheckoutSession(productId)
      if (result.clientSecret) {
        return result.clientSecret
      }
      throw new Error(result.error || "Failed to start checkout")
    } finally {
      setIsLoading(false)
    }
  }, [productId])

  return (
    <>
      <Button onClick={() => setOpen(true)} className="w-full" disabled={isLoading}>
        {tier === "free" ? "Current Plan" : "Upgrade"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Your Purchase</DialogTitle>
            <DialogDescription>Secure payment powered by Stripe</DialogDescription>
          </DialogHeader>
          <div id="checkout" className="min-h-[400px]">
            <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
