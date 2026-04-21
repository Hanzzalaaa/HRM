import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { new_password } = await request.json()

    if (!new_password || new_password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      )
    }

    const employee = await prisma.employees.findUnique({
      where: { id },
      select: { user_id: true }
    })

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    const hashedPassword = await bcrypt.hash(new_password, 10)

    await prisma.users.update({
      where: { id: employee.user_id },
      data: {
        password: hashedPassword,
        updated_at: new Date()
      }
    })

    return NextResponse.json({ success: true, message: "Password updated successfully" })
  } catch (error) {
    console.error("Error updating password:", error)
    return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
  }
}