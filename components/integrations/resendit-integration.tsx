"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle2, XCircle, Zap } from "lucide-react"
import { initiateResendItOAuth, disconnectResendIt } from "@/lib/actions/resendit-oauth"
import { executeResendItAgent, listResendItAgents } from "@/lib/actions/resendit-agents"
import { useToast } from "@/hooks/use-toast"

interface ResendItIntegrationProps {
  isConnected: boolean
}

export function ResendItIntegration({ isConnected: initialConnected }: ResendItIntegrationProps) {
  const [isConnected, setIsConnected] = useState(initialConnected)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleConnect = async () => {
    setLoading(true)
    try {
      await initiateResendItOAuth()
    } catch (error) {
      console.error("[v0] Resend-It connection error:", error)
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to Resend-It",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    setLoading(true)
    try {
      await disconnectResendIt()
      setIsConnected(false)
      toast({
        title: "Disconnected",
        description: "Successfully disconnected from Resend-It",
      })
    } catch (error) {
      console.error("[v0] Resend-It disconnect error:", error)
      toast({
        title: "Disconnect Failed",
        description: "Failed to disconnect from Resend-It",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTestAgent = async () => {
    setLoading(true)
    try {
      const agentsResult = await listResendItAgents()
      if (!agentsResult.success || !agentsResult.data?.length) {
        throw new Error("No agents available")
      }

      const firstAgent = agentsResult.data[0]
      const result = await executeResendItAgent({
        agentId: firstAgent.id,
        prompt: "Test agent execution from SaverFlow",
      })

      if (result.success) {
        toast({
          title: "Agent Executed",
          description: "Successfully executed test agent",
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("[v0] Test agent error:", error)
      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : "Failed to test agent",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600" />
              Resend-It AI Integration
            </CardTitle>
            <CardDescription>Connect your Resend-It account to execute AI agents and workflows</CardDescription>
          </div>
          {isConnected ? (
            <Badge variant="default" className="bg-green-500">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Connected
            </Badge>
          ) : (
            <Badge variant="secondary">
              <XCircle className="mr-1 h-3 w-3" />
              Not Connected
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Features</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Execute AI agents with financial context</li>
            <li>• Run automated workflows for financial analysis</li>
            <li>• Receive real-time webhook notifications</li>
            <li>• Access analytics and insights</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Permissions</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Execute Agents</Badge>
            <Badge variant="outline">Execute Workflows</Badge>
            <Badge variant="outline">Read Assets</Badge>
            <Badge variant="outline">Write Assets</Badge>
            <Badge variant="outline">Read Analytics</Badge>
          </div>
        </div>

        <div className="flex gap-2">
          {isConnected ? (
            <>
              <Button onClick={handleTestAgent} disabled={loading} variant="default">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Test Agent
              </Button>
              <Button onClick={handleDisconnect} disabled={loading} variant="outline">
                Disconnect
              </Button>
            </>
          ) : (
            <Button onClick={handleConnect} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Connect Resend-It
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
