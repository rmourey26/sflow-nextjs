"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { usePlaidLink, type PlaidLinkOnSuccess, type PlaidLinkOptions } from "react-plaid-link"
import { Button } from "@/components/ui/button"
import { Loader2, Building2, AlertCircle } from "lucide-react"
import { createLinkToken, exchangePublicToken } from "@/lib/actions/plaid"
import { toast } from "sonner"

interface PlaidLinkProps {
  onSuccess?: () => void
  variant?: "default" | "outline" | "secondary" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  children?: React.ReactNode
}

export function PlaidLink({ onSuccess, variant = "default", size = "default", className, children }: PlaidLinkProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isExchanging, setIsExchanging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchToken = async () => {
      setIsLoading(true)
      setError(null)
      const result = await createLinkToken()
      setIsLoading(false)

      if (result.error) {
        setError(result.error)
      } else if (result.linkToken) {
        setLinkToken(result.linkToken)
      }
    }

    fetchToken()
  }, [])

  const onPlaidSuccess = useCallback<PlaidLinkOnSuccess>(
    async (publicToken, metadata) => {
      setIsExchanging(true)
      const result = await exchangePublicToken(publicToken, metadata)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Successfully connected ${result.accounts} account(s)`)
        onSuccess?.()
      }
      setIsExchanging(false)
    },
    [onSuccess],
  )

  const config: PlaidLinkOptions = {
    token: linkToken,
    onSuccess: onPlaidSuccess,
    onExit: (err) => {
      if (err) {
        console.error("[v0] Plaid Link exit error:", err)
        // Don't show error for user-initiated exits
        if (err.error_code !== "USER_EXIT") {
          toast.error("Bank connection was interrupted. Please try again.")
        }
      }
    },
  }

  const { open, ready } = usePlaidLink(config)

  const handleClick = () => {
    if (error) {
      // Re-fetch token if there was an error
      setError(null)
      setIsLoading(true)
      createLinkToken().then((result) => {
        setIsLoading(false)
        if (result.error) {
          setError(result.error)
          toast.error(result.error)
        } else if (result.linkToken) {
          setLinkToken(result.linkToken)
          // Open after a brief delay to ensure hook is updated
          setTimeout(() => open(), 100)
        }
      })
    } else if (ready && linkToken) {
      open()
    }
  }

  const isDisabled = isLoading || isExchanging || (!ready && !error)
  const showError = error && !isLoading

  return (
    <Button
      onClick={handleClick}
      disabled={isDisabled}
      variant={showError ? "destructive" : variant}
      size={size}
      className={className}
    >
      {isLoading || isExchanging ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          {isExchanging ? "Connecting..." : "Initializing..."}
        </>
      ) : showError ? (
        <>
          <AlertCircle className="h-4 w-4 mr-2" />
          Retry Connection
        </>
      ) : children ? (
        children
      ) : (
        <>
          <Building2 className="h-4 w-4 mr-2" />
          Connect Bank Account
        </>
      )}
    </Button>
  )
}
