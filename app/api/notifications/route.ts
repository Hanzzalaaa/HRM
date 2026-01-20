import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const notifications: any[] = []

    // Get recent announcements (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const announcements = await prisma.announcement.findMany({
      where: {
        is_active: true,
        created_at: {
          gte: sevenDaysAgo
        },
        target_roles: {
          has: user.role
        }
      },
      select: {
        id: true,
        title: true,
        priority: true,
        created_at: true
      },
      orderBy: {
        created_at: 'desc'
      },
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

    // For HR and Super Admin: Get pending leave requests
    if (user.role === 'hr' || user.role === 'super_admin') {
      const pendingLeaves = await prisma.leave.findMany({
        where: {
          status: 'pending'
        },
        include: {
          employee: {
            include: {
              user: {
                select: {
                  full_name: true
                }
              }
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        take: 5
      })

      pendingLeaves.forEach((leave: any) => {
        notifications.push({
          id: `leave-${leave.id}`,
          type: 'leave_request',
          title: 'Leave Request',
          message: `${leave.employee.user.full_name} requested ${leave.leave_type} leave`,
          priority: 'medium',
          created_at: leave.created_at.toISOString(),
          link: user.role === 'super_admin' ? '/super-admin/leaves' : '/hr/leaves'
        })
      })
    }

    // For employees: Get their leave request status updates
    if (user.role === 'employee') {
      const employee = await prisma.employee.findUnique({
        where: { user_id: user.id },
        select: { id: true }
      })

      if (employee) {
        const recentLeaves = await prisma.leave.findMany({
          where: {
            employee_id: employee.id,
            status: {
              in: ['approved', 'rejected']
            },
            updated_at: {
              gte: sevenDaysAgo
            }
          },
          orderBy: {
            updated_at: 'desc'
          },
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

    // Sort by date
    notifications.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return NextResponse.json({ 
      success: true, 
      data: notifications.slice(0, 10), // Return max 10 notifications
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
