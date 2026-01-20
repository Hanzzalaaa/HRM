import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/ui/page-header"
import { AttendanceView } from "@/components/attendance/attendance-view"
import { EmployeeAttendanceView } from "@/components/attendance/employee-attendance-view"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default async function HRAttendancePage() {
  const user = await getCurrentUser()
  
  // Get HR's own employee record
  const hrEmployee = user ? await prisma.employee.findUnique({
    where: { user_id: user.id },
    select: { id: true }
  }) : null

  // Get HR's own attendance for this month
  let hrAttendance: any[] = []
  if (hrEmployee) {
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()
    const startDate = new Date(`${currentYear}-${String(currentMonth).padStart(2, "0")}-01`)

    const attendance = await prisma.attendance.findMany({
      where: {
        employee_id: hrEmployee.id,
        date: {
          gte: startDate
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    hrAttendance = attendance.map((record: any) => ({
      ...record,
      date: record.date.toISOString(),
      check_in: record.check_in?.toISOString() ?? undefined,
      check_out: record.check_out?.toISOString() ?? undefined,
      work_hours: record.work_hours ?? undefined,
      notes: record.notes ?? undefined,
      created_at: record.created_at.toISOString(),
      updated_at: record.updated_at.toISOString()
    }))
  }

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

      {/* HR's Personal Attendance */}
      {hrEmployee && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>My Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <EmployeeAttendanceView attendance={hrAttendance} employeeId={hrEmployee.id} />
            </CardContent>
          </Card>
          
          <Separator className="my-6" />
        </>
      )}

      {/* All Employees Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Team Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <AttendanceView attendance={attendance} employees={employees} date={today.toISOString().split("T")[0]} />
        </CardContent>
      </Card>
    </div>
  )
}
