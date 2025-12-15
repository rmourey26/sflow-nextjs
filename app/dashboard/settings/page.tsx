import { getUserPreferences } from "@/lib/actions/preferences"
import { SettingsForm } from "@/components/dashboard/settings-form"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
  const preferences = await getUserPreferences()

  if (!preferences) {
    redirect("/login")
  }

  return (
    <main className="container mx-auto px-4 py-6 space-y-6 max-w-3xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      <SettingsForm preferences={preferences} />
    </main>
  )
}
