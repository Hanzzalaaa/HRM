import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const announcement = await prisma.announcements.findUnique({
      where: { id }
    })

    if (!announcement) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: announcement })
  } catch (error) {
    console.error("Error fetching announcement:", error)
    return NextResponse.json(
      { error: "Failed to fetch announcement" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.announcements.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting announcement:", error)
    return NextResponse.json(
      { error: "Failed to delete announcement" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, priority, expires_at } = body

    const announcement = await prisma.announcements.update({
      where: { id },
      data: {
        title,
        content,
        priority,
        expires_at: expires_at ? new Date(expires_at) : null,
        updated_at: new Date()
      }
    })

    return NextResponse.json({ success: true, data: announcement })
  } catch (error) {
    console.error("Error updating announcement:", error)
    return NextResponse.json(
      { error: "Failed to update announcement" },
      { status: 500 }
    )
  }
}