import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { getCurrentUser } from "@/lib/auth"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser || (currentUser.role !== "super_admin" && currentUser.role !== "hr")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { new_password } = body

    if (!new_password || new_password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      )
    }

    // Get employee to find user_id
    const employee = await prisma.employee.findUnique({
      where: { id },
      select: { user_id: true }
    })

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      )
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(new_password, 10)

    // Update user password
    await prisma.user.update({
      where: { id: employee.user_id },
      data: {
        password: hashedPassword
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: "Password updated successfully" 
    })
  } catch (error) {
    console.error("Error updating password:", error)
    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 }
    )
  }
}
