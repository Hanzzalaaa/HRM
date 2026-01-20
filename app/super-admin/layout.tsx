import type React from "react"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/layout/dashboard-shell"

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  if (!user || user.role !== "super_admin") {
    redirect("/auth/login")
  }

  return (
    <DashboardShell user={user} basePath="/super-admin">
      {children}
    </DashboardShell>
  )
}
