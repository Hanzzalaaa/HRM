import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const announcements = await prisma.announcements.findMany({
      orderBy: { created_at: "desc" },
      include: {
        users: {
          select: { full_name: true }
        }
      }
    })

    return NextResponse.json({ success: true, data: announcements })
  } catch (error) {
    console.error("Error fetching announcements:", error)
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, priority, expires_at } = body
    console.log("-=====================>", "Done0")
    
    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      )
    }

    console.log("-=====================>", "Done")
    const announcement = await prisma.announcements.create({
        data: {
            id: crypto.randomUUID(),
            title,
            content,
            priority: priority || "medium",
            target_roles: [],
            target_departments: [],
            is_active: true,
        published_at: new Date(),
        expires_at: expires_at ? new Date(expires_at) : null,
        created_by: user.id,
        updated_at: new Date()
    }
})

console.log("-=====================>", "Done 2")
    return NextResponse.json({ success: true, data: announcement })
  } catch (error) {
    console.error("Error creating announcement:", error)
    return NextResponse.json(
      { error: "Failed to create announcement" },
      { status: 500 }
    )
  }
}