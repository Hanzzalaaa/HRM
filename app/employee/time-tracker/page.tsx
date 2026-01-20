import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"

export default async function TimeTrackerPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Redirect to attendance page as time tracking is handled there
  redirect("/employee/attendance")
}
