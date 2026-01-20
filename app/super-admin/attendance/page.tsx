import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/ui/page-header"
import { AttendanceView } from "@/components/attendance/attendance-view"

export default async function AttendancePage() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const attendanceData = await prisma.attendance.findMany({
    where: {
      date: today
    },
    include: {
      employee: {
        select: {
          employee_id: true,
          designation: true,
          user: {
            select: {
              full_name: true,
              avatar_url: true
            }
          },
          department: {
            select: {
              name: true
            }
          }
        }
      }
    },
    orderBy: {
      created_at: 'desc'
    }
  })

  const employeesData = await prisma.employee.findMany({
    where: {
      user: {
        status: 'active'
      }
    },
    select: {
      id: true,
      employee_id: true,
      user: {
        select: {
          full_name: true,
          status: true
        }
      }
    }
  })

  // Transform to match component's expected structure
  const attendance = attendanceData.map((att: any) => ({
    ...att,
    date: att.date.toISOString(),
    check_in: att.check_in?.toISOString() ?? undefined,
    check_out: att.check_out?.toISOString() ?? undefined,
    work_hours: att.work_hours ?? undefined,
    notes: att.notes ?? undefined,
    created_at: att.created_at.toISOString(),
    updated_at: att.updated_at.toISOString(),
    employees: {
      employee_id: att.employee.employee_id,
      designation: att.employee.designation,
      users: {
        full_name: att.employee.user.full_name,
        avatar_url: att.employee.user.avatar_url ?? undefined
      },
      departments: att.employee.department
    }
  }))

  const employees = employeesData.map((emp: any) => ({
    ...emp,
    users: emp.user
  }))

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance" description="Track and manage daily attendance" />

      <AttendanceView attendance={attendance} employees={employees} date={today.toISOString().split("T")[0]} />
    </div>
  )
}
