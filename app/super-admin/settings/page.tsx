import { getCurrentUser } from "@/lib/auth"
import { PageHeader } from "@/components/ui/page-header"
import { SettingsForm } from "@/components/settings/settings-form"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function SuperAdminSettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account settings and preferences" />

      <SettingsForm user={user} />
    </div>
  )
}
