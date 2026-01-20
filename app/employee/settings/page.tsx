import { getCurrentUser } from "@/lib/auth"
import { PageHeader } from "@/components/ui/page-header"
import { SettingsForm } from "@/components/settings/settings-form"
import { redirect } from "next/navigation"

export default async function EmployeeSettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Convert Date fields to strings for the form component
  const userProfile = {
    ...user,
    created_at: user.created_at,
    updated_at: user.updated_at,
    avatar_url: user.avatar_url ?? undefined
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account settings and preferences" />

      <SettingsForm user={userProfile} />
    </div>
  )
}
