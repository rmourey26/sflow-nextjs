"use client"

import { useState, useCallback } from "react"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { startCheckoutSession } from "@/lib/actions/stripe"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface StripeCheckoutProps {
  productId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StripeCheckout({ productId, open, onOpenChange }: StripeCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  const fetchClientSecret = useCallback(async () => {
    const result = await startCheckoutSession(productId)
    if (result.clientSecret) {
      return result.clientSecret
    }
    throw new Error(result.error || "Failed to start checkout")
  }, [productId])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
  )
}
