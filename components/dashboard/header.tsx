import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bell, Menu, Settings } from "lucide-react"
import type { Database } from "@/types/database"

type User = Database["public"]["Tables"]["users"]["Row"]

interface DashboardHeaderProps {
  user: User | null
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U"

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 py-3 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>

            <Link href="/dashboard" className="flex items-center gap-2">
              <Image src="/icons/icon-192x192.png" alt="SaverFlow" width={32} height={32} className="h-8 w-8" />
              <span className="hidden font-semibold text-lg sm:inline">SaverFlow</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-purple-600">
              Dashboard
            </Link>
            <Link href="/accounts" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Accounts
            </Link>
            <Link href="/goals" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Goals
            </Link>
            <Link href="/insights" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Insights
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-purple-600" />
            </Button>

            <Link href="/settings">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>

            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-purple-100 text-purple-700 text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  )
}
