import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.users.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const notifications: any[] = []
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const announcements = await prisma.announcements.findMany({
      where: {
        is_active: true,
        created_at: { gte: sevenDaysAgo },
      },
      select: {
        id: true,
        title: true,
        priority: true,
        created_at: true
      },
      orderBy: { created_at: 'desc' },
      take: 5
    })

    announcements.forEach((announcement: any) => {
      notifications.push({
        id: `announcement-${announcement.id}`,
        type: 'announcement',
        title: 'New Announcement',
        message: announcement.title,
        priority: announcement.priority,
        created_at: announcement.created_at.toISOString(),
        link: user.role === 'employee' ? '/employee/announcements' : user.role === 'super_admin' ? '/super-admin/announcements' : '/hr/announcements'
      })
    })

    if (user.role === 'hr' || user.role === 'super_admin') {
      const pendingLeaves = await prisma.leaves.findMany({
        where: { status: 'pending' },
        include: {
          employees: {
            include: {
              users: { select: { full_name: true } }
            }
          }
        },
        orderBy: { created_at: 'desc' },
        take: 5
      })

      pendingLeaves.forEach((leave: any) => {
        notifications.push({
          id: `leave-${leave.id}`,
          type: 'leave_request',
          title: 'Leave Request',
          message: `${leave.employees.users.full_name} requested ${leave.leave_type} leave`,
          priority: 'medium',
          created_at: leave.created_at.toISOString(),
          link: user.role === 'super_admin' ? '/super-admin/leaves' : '/hr/leaves'
        })
      })
    }

    if (user.role === 'employee') {
      const employee = await prisma.employees.findUnique({
        where: { user_id: user.id },
        select: { id: true }
      })

      if (employee) {
        const recentLeaves = await prisma.leaves.findMany({
          where: {
            employee_id: employee.id,
            status: { in: ['approved', 'rejected'] },
            updated_at: { gte: sevenDaysAgo }
          },
          orderBy: { updated_at: 'desc' },
          take: 5
        })

        recentLeaves.forEach((leave: any) => {
          notifications.push({
            id: `leave-status-${leave.id}`,
            type: 'leave_status',
            title: `Leave ${leave.status}`,
            message: `Your ${leave.leave_type} leave request has been ${leave.status}`,
            priority: leave.status === 'approved' ? 'low' : 'medium',
            created_at: leave.updated_at.toISOString(),
            link: '/employee/leaves'
          })
        })
      }
    }

    notifications.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return NextResponse.json({
      success: true,
      data: notifications.slice(0, 10),
      count: notifications.length
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    )
  }
}