import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { password } = await request.json()

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
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

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.users.update({
      where: { id: employee.user_id },
      data: {
        password: hashedPassword,
        updated_at: new Date()
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    )
  }
}