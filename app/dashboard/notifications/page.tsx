import { NotificationsList } from "@/components/dashboard/notifications-list"

export default async function NotificationsPage() {
  return (
    <main className="container mx-auto px-4 py-6 space-y-6 max-w-3xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600">Stay updated with your financial activity</p>
      </div>

      <NotificationsList />
    </main>
  )
}
