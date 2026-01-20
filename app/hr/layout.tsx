import type React from "react"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/layout/dashboard-shell"

export default async function HRLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  if (!user || !["super_admin", "hr"].includes(user.role)) {
    redirect("/auth/login")
  }

  return (
    <DashboardShell user={user} basePath="/hr">
      {children}
    </DashboardShell>
  )
}
