"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Bell, Menu, Settings, LayoutDashboard, Wallet, Target, Lightbulb, CreditCard } from "lucide-react"
import type { Database } from "@/types/database"
import { cn } from "@/lib/utils"

type User = Database["public"]["Tables"]["users"]["Row"]

interface DashboardHeaderProps {
  user: User | null
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/accounts", label: "Accounts", icon: Wallet },
  { href: "/dashboard/goals", label: "Goals", icon: Target },
  { href: "/dashboard/insights", label: "Insights", icon: Lightbulb },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
]

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U"

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-lg supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Mobile menu and logo */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden tap-target">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[320px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Image src="/icons/icon-192x192.png" alt="SaverFlow" width={32} height={32} />
                    SaverFlow
                  </SheetTitle>
                  <SheetDescription>Navigate your financial dashboard</SheetDescription>
                </SheetHeader>
                <nav className="flex flex-col gap-2 mt-6">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors tap-target",
                          isActive ? "bg-purple-50 text-purple-700 font-medium" : "text-gray-700 hover:bg-gray-50",
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    )
                  })}
                </nav>
              </SheetContent>
            </Sheet>

            <Link href="/dashboard" className="flex items-center gap-2 sm:gap-3">
              <Image
                src="/icons/icon-192x192.png"
                alt="SaverFlow"
                width={32}
                height={32}
                className="h-7 w-7 sm:h-8 sm:w-8"
              />
              <span className="hidden font-semibold text-base sm:text-lg sm:inline">SaverFlow</span>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive ? "bg-purple-50 text-purple-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* User actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="icon" className="relative tap-target">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-purple-600" />
              <span className="sr-only">Notifications</span>
            </Button>

            <Link href="/dashboard/settings">
              <Button variant="ghost" size="icon" className="tap-target">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
            </Link>

            <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
              <AvatarFallback className="bg-purple-100 text-purple-700 text-xs sm:text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  )
}
