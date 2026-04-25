import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Redirect based on role
  switch (user.role) {
    case "super_admin":
      redirect("/super-admin")
    case "hr":
      redirect("/hr")
    default:
      redirect("/employee")
  }
}
