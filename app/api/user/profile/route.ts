import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

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
    const { full_name, avatar_url } = body

    const updateData: any = { full_name }
    
    // Only update avatar_url if provided
    if (avatar_url !== undefined) {
      updateData.avatar_url = avatar_url
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData
    })

    return NextResponse.json({ success: true, data: updatedUser })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}
