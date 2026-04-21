"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Building2,
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  DollarSign,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  ClipboardList,
  TrendingUp,
  UserCheck,
  Clock,
  type LucideIcon,
} from "lucide-react"
import type { UserRole } from "@/lib/types/database"

interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  roles: UserRole[]
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "",
    icon: LayoutDashboard,
    roles: ["super_admin", "hr", "employee"],
  },
  {
    title: "Employees",
    href: "/employees",
    icon: Users,
    roles: ["super_admin", "hr"],
  },
  {
    title: "Departments",
    href: "/departments",
    icon: Briefcase,
    roles: ["super_admin", "hr"],
  },
  {
    title: "Attendance",
    href: "/attendance",
    icon: UserCheck,
    roles: ["super_admin", "hr", "employee"],
  },
  {
    title: "Leaves",
    href: "/leaves",
    icon: Calendar,
    roles: ["super_admin", "hr", "employee"],
  },
  {
    title: "Payroll",
    href: "/payroll",
    icon: DollarSign,
    roles: ["super_admin", "hr"],
  },
  {
    title: "My Salary",
    href: "/salary",
    icon: DollarSign,
    roles: ["employee"],
  },
  {
    title: "Financials",
    href: "/financials",
    icon: TrendingUp,
    roles: ["super_admin"],
  },
  {
    title: "Announcements",
    href: "/announcements",
    icon: Bell,
    roles: ["super_admin", "hr", "employee"],
  },
  {
    title: "Time Tracker",
    href: "/time-tracker",
    icon: Clock,
    roles: ["employee"],
  },
  {
    title: "Reports",
    href: "/reports",
    icon: FileText,
    roles: ["super_admin", "hr"],
  },
  {
    title: "Activity Logs",
    href: "/activity-logs",
    icon: ClipboardList,
    roles: ["super_admin"],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["super_admin", "hr", "employee"],
  },
]

interface SidebarProps {
  role: UserRole
  basePath: string
}

export function Sidebar({ role, basePath }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const filteredNavItems = navItems.filter((item) => item.roles.includes(role))

  return (
    <aside
      className={cn("relative flex flex-col border-r bg-card transition-all duration-300", collapsed ? "w-16" : "w-64")}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link href={basePath} className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="font-semibold text-lg">Revolix</span>
          </Link>
        )}
        {collapsed && (
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground mx-auto">
            <Building2 className="w-5 h-5" />
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-20 z-10 h-6 w-6 rounded-full border bg-background shadow-sm"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {filteredNavItems.map((item) => {
            const href = `${basePath}${item.href}`
            const isActive = item.href === "" 
              ? pathname === basePath 
              : pathname === href || pathname.startsWith(`${href}/`)

            return (
              <Link
                key={item.href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0")} />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
    </aside>
  )
}