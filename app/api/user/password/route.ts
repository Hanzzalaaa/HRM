import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { current_password, new_password } = body

    // Get user with password
    const userWithPassword = await prisma.user.findUnique({
      where: { id: user.id },
      select: { password: true }
    })

    if (!userWithPassword) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Verify current password
    const isValid = await bcrypt.compare(current_password, userWithPassword.password)

    if (!isValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10)

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating password:", error)
    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 }
    )
  }
}
