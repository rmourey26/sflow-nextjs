import { getCurrentUser } from "@/lib/actions/user"
import { ProfileForm } from "@/components/dashboard/profile-form"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <main className="container mx-auto px-4 py-6 space-y-6 max-w-3xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your personal information</p>
      </div>

      <ProfileForm user={user} />
    </main>
  )
}
