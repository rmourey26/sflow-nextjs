"use client"

import { useState, useCallback } from "react"
import { usePlaidLink } from "react-plaid-link"
import { Button } from "@/components/ui/button"
import { Loader2, Building2 } from "lucide-react"
import { createLinkToken, exchangePublicToken } from "@/lib/actions/plaid"
import { toast } from "sonner"

interface PlaidLinkProps {
  onSuccess?: () => void
  variant?: "default" | "outline" | "secondary"
  size?: "default" | "sm" | "lg"
}

export function PlaidLink({ onSuccess, variant = "default", size = "default" }: PlaidLinkProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const onSuccessCallback = useCallback(
    async (publicToken: string, metadata: any) => {
      setIsLoading(true)
      const result = await exchangePublicToken(publicToken, metadata)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Successfully connected ${result.accounts} account(s)`)
        onSuccess?.()
      }
      setIsLoading(false)
    },
    [onSuccess],
  )

  const config = {
    token: linkToken,
    onSuccess: onSuccessCallback,
  }

  const { open, ready } = usePlaidLink(config)

  const handleClick = async () => {
    if (!linkToken) {
      setIsLoading(true)
      const result = await createLinkToken()
      setIsLoading(false)

      if (result.error || !result.linkToken) {
        toast.error(result.error || "Failed to initialize Plaid")
        return
      }

      setLinkToken(result.linkToken)
      // Open will be triggered by the useEffect in usePlaidLink
      setTimeout(() => open(), 100)
    } else {
      open()
    }
  }

  return (
    <Button onClick={handleClick} disabled={isLoading || !ready} variant={variant} size={size} className="gap-2">
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Building2 className="h-4 w-4" />
          Connect Bank Account
        </>
      )}
    </Button>
  )
}
