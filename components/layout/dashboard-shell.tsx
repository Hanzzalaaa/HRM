import type { ReactNode } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import type { User, UserRole } from "@/lib/types/database"

interface DashboardShellProps {
  children: ReactNode
  user: User
  basePath: string
}

export function DashboardShell({ children, user, basePath }: DashboardShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      <Sidebar role={user.role as UserRole} basePath={basePath} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
