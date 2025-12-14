"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { markAsRead, markAllAsRead, deleteNotification } from "@/lib/actions/notifications"
import type { Database } from "@/types/database"
import { Bell, Check, CheckCheck, Info, AlertTriangle, AlertCircle, Trash2, ExternalLink } from "lucide-react"
import Link from "next/link"

type Notification = Database["public"]["Tables"]["notifications"]["Row"]

interface NotificationsListProps {
  initialNotifications: Notification[]
}

export function NotificationsList({ initialNotifications }: NotificationsListProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAsRead = (id: string) => {
    startTransition(async () => {
      try {
        await markAsRead(id)
        setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
      } catch (error) {
        toast({ title: "Failed to mark as read", variant: "destructive" })
      }
    })
  }

  const handleMarkAllAsRead = () => {
    startTransition(async () => {
      try {
        await markAllAsRead()
        setNotifications(notifications.map((n) => ({ ...n, read: true })))
        toast({ title: "All notifications marked as read" })
      } catch (error) {
        toast({ title: "Failed to mark all as read", variant: "destructive" })
      }
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteNotification(id)
        setNotifications(notifications.filter((n) => n.id !== id))
        toast({ title: "Notification deleted" })
      } catch (error) {
        toast({ title: "Failed to delete notification", variant: "destructive" })
      }
    })
  }

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <Check className="h-5 w-5 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllAsRead} disabled={isPending}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark All Read
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card key={notification.id} className={notification.read ? "opacity-60" : "border-primary/20 bg-primary/5"}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  {getIcon(notification.type)}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{notification.title}</CardTitle>
                      {!notification.read && (
                        <Badge variant="default" className="h-5 text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{notification.message}</CardDescription>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.created_at).toLocaleDateString()} at{" "}
                      {new Date(notification.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(notification.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {notification.action_url && (
              <CardContent className="pt-0">
                <Button variant="link" size="sm" asChild className="h-auto p-0">
                  <Link href={notification.action_url}>
                    View Details
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {notifications.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No notifications</h3>
            <p className="text-center text-sm text-muted-foreground">
              You're all caught up! Check back later for updates
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
