import type React from "react"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/layout/dashboard-shell"

export const dynamic = 'force-dynamic'

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <DashboardShell user={user} basePath="/employee">
      {children}
    </DashboardShell>
  )
}
