"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, Settings, User } from "lucide-react"
import { getInitials, getRoleBadgeColor } from "@/lib/utils/helpers"
import type { User as UserType } from "@/lib/types/database"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationsDropdown } from "@/components/layout/notifications-dropdown"

interface HeaderProps {
  user: UserType
}

export function Header({ user }: HeaderProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setLoading(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push("/auth/login")
    router.refresh()
  }

  const roleLabels: Record<string, string> = {
    super_admin: "Super Admin",
    hr: "HR Manager",
    employee: "Employee",
  }

  const profilePath = user.role === "super_admin"
    ? "/super-admin/settings"
    : user.role === "hr"
    ? "/hr/settings"
    : "/employee/settings"

  return (
    <header className="h-16 border-b bg-card px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">Welcome back, {user.full_name.split(" ")[0]}</h2>
        <Badge className={getRoleBadgeColor(user.role)} variant="secondary">
          {roleLabels[user.role]}
        </Badge>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <NotificationsDropdown />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.full_name} />
                <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user.full_name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(profilePath)}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(profilePath)}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={loading}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {loading ? "Signing out..." : "Sign out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}