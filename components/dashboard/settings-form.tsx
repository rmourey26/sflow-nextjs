"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { updateUserPreferences } from "@/lib/actions/preferences"
import { deleteUserAccount, exportUserData } from "@/lib/actions/user"
import type { Database } from "@/types/database"
import { Bell, Mail, Smartphone, Moon, DollarSign, Calendar, Cookie, Shield, Download, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

type UserPreferences = Database["public"]["Tables"]["user_preferences"]["Row"]

interface SettingsFormProps {
  preferences: UserPreferences
}

export function SettingsForm({ preferences: initialPreferences }: SettingsFormProps) {
  const [preferences, setPreferences] = useState(initialPreferences)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true, // Always enabled
    analytics: true,
    marketing: false,
  })

  const [dataCollection, setDataCollection] = useState({
    crashReports: true,
    usageAnalytics: true,
    personalizedAds: false,
  })

  const handleUpdate = (updates: Partial<UserPreferences>) => {
    const newPreferences = { ...preferences, ...updates }
    setPreferences(newPreferences as UserPreferences)

    startTransition(async () => {
      try {
        await updateUserPreferences(updates)
        toast({ title: "Settings updated successfully" })
      } catch (error) {
        toast({ title: "Failed to update settings", variant: "destructive" })
        setPreferences(preferences)
      }
    })
  }

  const handleExportData = async () => {
    try {
      const data = await exportUserData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `saverflow-data-${new Date().toISOString()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast({ title: "Data exported successfully" })
    } catch (error) {
      toast({ title: "Failed to export data", variant: "destructive" })
    }
  }

  const handleDeleteAccount = async () => {
    try {
      await deleteUserAccount()
      toast({ title: "Account deleted successfully" })
      router.push("/")
    } catch (error) {
      toast({ title: "Failed to delete account", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your app preferences and notifications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cookie className="h-5 w-5" />
            Cookie Preferences
          </CardTitle>
          <CardDescription>Manage how we use cookies and tracking</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Essential Cookies</Label>
              <p className="text-sm text-muted-foreground">Required for the app to function (always enabled)</p>
            </div>
            <Switch checked disabled />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Analytics Cookies</Label>
              <p className="text-sm text-muted-foreground">Help us improve the app by tracking usage patterns</p>
            </div>
            <Switch
              checked={cookiePreferences.analytics}
              onCheckedChange={(checked) => setCookiePreferences({ ...cookiePreferences, analytics: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Marketing Cookies</Label>
              <p className="text-sm text-muted-foreground">Used to show relevant ads and promotions</p>
            </div>
            <Switch
              checked={cookiePreferences.marketing}
              onCheckedChange={(checked) => setCookiePreferences({ ...cookiePreferences, marketing: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Data Collection & Privacy
          </CardTitle>
          <CardDescription>Control what data we collect and how we use it</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Crash Reports</Label>
              <p className="text-sm text-muted-foreground">Automatically send error reports to help us fix bugs</p>
            </div>
            <Switch
              checked={dataCollection.crashReports}
              onCheckedChange={(checked) => setDataCollection({ ...dataCollection, crashReports: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Usage Analytics</Label>
              <p className="text-sm text-muted-foreground">Share anonymous usage data to improve features</p>
            </div>
            <Switch
              checked={dataCollection.usageAnalytics}
              onCheckedChange={(checked) => setDataCollection({ ...dataCollection, usageAnalytics: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Personalized Ads</Label>
              <p className="text-sm text-muted-foreground">Allow us to show ads tailored to your interests</p>
            </div>
            <Switch
              checked={dataCollection.personalizedAds}
              onCheckedChange={(checked) => setDataCollection({ ...dataCollection, personalizedAds: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Choose how you want to be notified</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">Receive notifications via email</p>
            </div>
            <Switch
              checked={preferences.email_notifications}
              onCheckedChange={(checked) => handleUpdate({ email_notifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                Push Notifications
              </Label>
              <p className="text-sm text-muted-foreground">Receive push notifications in your browser</p>
            </div>
            <Switch
              checked={preferences.push_notifications}
              onCheckedChange={(checked) => handleUpdate({ push_notifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive text message alerts</p>
            </div>
            <Switch
              checked={preferences.sms_notifications}
              onCheckedChange={(checked) => handleUpdate({ sms_notifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">Receive product updates and tips</p>
            </div>
            <Switch
              checked={preferences.marketing_emails}
              onCheckedChange={(checked) => handleUpdate({ marketing_emails: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>Choose which notifications you want to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekly Summary</Label>
              <p className="text-sm text-muted-foreground">Get a weekly report of your finances</p>
            </div>
            <Switch
              checked={preferences.weekly_summary}
              onCheckedChange={(checked) => handleUpdate({ weekly_summary: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Goal Reminders</Label>
              <p className="text-sm text-muted-foreground">Reminders to contribute to your savings goals</p>
            </div>
            <Switch
              checked={preferences.goal_reminders}
              onCheckedChange={(checked) => handleUpdate({ goal_reminders: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Transaction Alerts</Label>
              <p className="text-sm text-muted-foreground">Get notified about new transactions</p>
            </div>
            <Switch
              checked={preferences.transaction_alerts}
              onCheckedChange={(checked) => handleUpdate({ transaction_alerts: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Budget Alerts</Label>
              <p className="text-sm text-muted-foreground">Alerts when approaching budget limits</p>
            </div>
            <Switch
              checked={preferences.budget_alerts}
              onCheckedChange={(checked) => handleUpdate({ budget_alerts: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Appearance & Format
          </CardTitle>
          <CardDescription>Customize how information is displayed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select
              value={preferences.theme}
              onValueChange={(value: "light" | "dark" | "system") => handleUpdate({ theme: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              Currency
            </Label>
            <Select value={preferences.currency} onValueChange={(value) => handleUpdate({ currency: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="JPY">JPY (¥)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Date Format
            </Label>
            <Select value={preferences.date_format} onValueChange={(value) => handleUpdate({ date_format: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Export or delete your account data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={handleExportData}>
              <Download className="mr-2 h-4 w-4" />
              Export My Data
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex-1">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account and remove all your data
                    from our servers including accounts, transactions, goals, and preferences.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground"
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <p className="text-sm text-muted-foreground">
            Export your data as JSON to back it up or transfer it. Account deletion is permanent and cannot be reversed.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
