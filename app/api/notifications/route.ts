import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, data: [] })
    }

    const notifications = await prisma.announcements.findMany({
      orderBy: { created_at: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        content: true,
        priority: true,
        created_at: true,
      }
    })

    const formatted = notifications.map((n: any) => ({
      id: n.id,
      type: "info",
      title: n.title,
      message: n.content,
      priority: n.priority ?? "normal",
      created_at: n.created_at.toISOString(),
      link: `/${user.role}/announcements`,
    }))

    return NextResponse.json({ success: true, data: formatted })
  } catch (error) {
    console.error("Notifications error:", error)
    return NextResponse.json({ success: true, data: [] })
  }
}