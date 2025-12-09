"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, CheckCircle2, X } from "lucide-react"
import { acceptSmartAction, dismissSmartAction } from "@/lib/actions/smart-actions"
import { useTransition } from "react"
import type { Database } from "@/types/database"

type SmartAction = Database["public"]["Tables"]["smart_actions"]["Row"]

interface SmartActionsWidgetProps {
  actions: SmartAction[]
}

const actionTypeColors = {
  SAVE: "bg-teal-100 text-teal-700",
  SPEND: "bg-purple-100 text-purple-700",
  PREPARE: "bg-blue-100 text-blue-700",
  SMOOTH: "bg-orange-100 text-orange-700",
  RISK_ALERT: "bg-red-100 text-red-700",
}

export function SmartActionsWidget({ actions }: SmartActionsWidgetProps) {
  const [isPending, startTransition] = useTransition()

  const handleAccept = (id: string) => {
    startTransition(async () => {
      await acceptSmartAction(id)
    })
  }

  const handleDismiss = (id: string) => {
    startTransition(async () => {
      await dismissSmartAction(id)
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-purple-600" />
          Smart Actions
        </CardTitle>
        <CardDescription>AI-powered recommendations</CardDescription>
      </CardHeader>
      <CardContent>
        {actions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-600">No recommendations yet</p>
            <p className="text-xs text-gray-500 mt-1">We'll analyze your finances and suggest actions soon</p>
          </div>
        ) : (
          <div className="space-y-4">
            {actions.slice(0, 3).map((action) => (
              <div key={action.id} className="p-4 rounded-lg border bg-white space-y-3">
                <div className="flex items-start justify-between">
                  <Badge variant="secondary" className={actionTypeColors[action.type]}>
                    {action.type.replace("_", " ")}
                  </Badge>
                  <span className="text-xs text-gray-500">Priority {action.priority}</span>
                </div>
                <div>
                  <p className="font-medium text-sm">{action.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{action.description}</p>
                  {action.action_amount && (
                    <p className="text-sm font-semibold text-purple-600 mt-2">
                      ${Number.parseFloat(action.action_amount).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={() => handleAccept(action.id)} disabled={isPending}>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => handleDismiss(action.id)}
                    disabled={isPending}
                  >
                    <X className="h-3.5 w-3.5 mr-1.5" />
                    Dismiss
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
