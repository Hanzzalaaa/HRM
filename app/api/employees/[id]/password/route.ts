import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Employees can only change their own password via this route.
    // HR and super_admin can change any employee's password.
    const employee = await prisma.employees.findUnique({
      where: { id },
      select: { user_id: true },
    })

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    const isSelf = currentUser.id === employee.user_id
    const isAdmin = ['super_admin', 'hr'].includes(currentUser.role)

    if (!isSelf && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { new_password } = body

    if (!new_password) {
      return NextResponse.json({ error: "new_password is required" }, { status: 400 })
    }

    if (new_password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(new_password, 10)

    await prisma.users.update({
      where: { id: employee.user_id },
      data: {
        password: hashedPassword,
        updated_at: new Date(),
      },
    })

    return NextResponse.json({ success: true, message: "Password updated successfully" })
  } catch (error) {
    console.error("Error updating password:", error)
    return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
  }
}