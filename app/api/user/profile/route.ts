import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { full_name, avatar_url } = body

    if (!full_name || typeof full_name !== 'string' || full_name.trim() === '') {
      return NextResponse.json({ error: "full_name is required" }, { status: 400 })
    }

    const updateData: any = {
      full_name: full_name.trim(),
      updated_at: new Date(),
    }

    if (avatar_url !== undefined) {
      updateData.avatar_url = avatar_url
    }

    const updatedUser = await prisma.users.update({
      where: { id: user.id },
      data: updateData,
      // Strip password from the returned record
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        avatar_url: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    })

    return NextResponse.json({ success: true, data: updatedUser })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}