import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()

    // Use a raw-style filter that PostgreSQL can execute efficiently:
    // - is_active = true
    // - expires_at is null OR expires_at > now
    // - target_roles is empty array OR contains the user's role
    // Prisma's array filters (isEmpty, has) on Supabase/pgbouncer can be slow;
    // splitting into two separate queries and merging in JS is faster here.
    const [unrestricted, targeted] = await Promise.all([
      // Announcements with no role restriction
      prisma.announcements.findMany({
        where: {
          is_active: true,
          target_roles: { isEmpty: true },
          OR: [
            { expires_at: null },
            { expires_at: { gt: now } },
          ],
        },
        orderBy: [{ priority: "desc" }, { created_at: "desc" }],
        take: 10,
        select: {
          id: true,
          title: true,
          content: true,
          priority: true,
          created_at: true,
        },
      }),
      // Announcements explicitly targeting this role
      prisma.announcements.findMany({
        where: {
          is_active: true,
          target_roles: { has: user.role as any },
          OR: [
            { expires_at: null },
            { expires_at: { gt: now } },
          ],
        },
        orderBy: [{ priority: "desc" }, { created_at: "desc" }],
        take: 10,
        select: {
          id: true,
          title: true,
          content: true,
          priority: true,
          created_at: true,
        },
      }),
    ])

    // Merge, deduplicate by id, sort by priority then date, take top 10
    const seen = new Set<string>()
    const merged = [...unrestricted, ...targeted]
      .filter((n) => {
        if (seen.has(n.id)) return false
        seen.add(n.id)
        return true
      })
      .sort((a, b) => {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
        const pa = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 4
        const pb = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 4
        if (pa !== pb) return pa - pb
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
      .slice(0, 10)

    const rolePathMap: Record<string, string> = {
      super_admin: "super-admin",
      hr: "hr",
      employee: "employee",
    }
    const rolePath = rolePathMap[user.role] ?? user.role

    const formatted = merged.map((n) => ({
      id: n.id,
      type: "info",
      title: n.title,
      message: n.content,
      priority: n.priority,
      created_at: n.created_at.toISOString(),
      link: `/${rolePath}/announcements`,
    }))

    return NextResponse.json(
      { success: true, data: formatted },
      {
        headers: {
          // Cache for 30 seconds — matches the frontend polling interval
          "Cache-Control": "private, max-age=30, stale-while-revalidate=10",
        },
      }
    )
  } catch (error) {
    console.error("Notifications error:", error)
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    )
  }
}