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
  const hrEmployee = user ? await prisma.employees.findUnique({
    where: { user_id: user.id },
    select: { id: true }
  }) : null

  // Get HR's own attendance for this month
  let hrAttendance: any[] = []
  if (hrEmployee) {
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()
    const startDate = new Date(`${currentYear}-${String(currentMonth).padStart(2, "0")}-01`)

    const attendance = await prisma.attendances.findMany({
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

  const attendanceData = await prisma.attendances.findMany({
    where: {
      date: today
    },
    include: {
      employees: {
        select: {
          employee_id: true,
          designation: true,
          users: {   // ✅ FIX
            select: {
              full_name: true,
              avatar_url: true
            }
          },
          departments_employees_department_idTodepartments: { // ✅ FIX
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

  const employeesData = await prisma.employees.findMany({
    where: {
      users: {
        status: 'active'
      }
    },
    select: {
      id: true,
      employee_id: true,
      users: {
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
      employee_id: att.employees.employee_id,   // ✅ FIX
      designation: att.employees.designation,   // ✅ FIX
      users: {
        full_name: att.employees.users.full_name,   // ✅ FIX
        avatar_url: att.employees.users.avatar_url ?? undefined
      },
      departments: att.employees
        .departments_employees_department_idTodepartments // ✅ FIX
    }
  }))

  const employees = employeesData.map((emp: any) => ({
    ...emp,
    users: emp.users   // ✅ FIX
  }))

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance" description="Track and manage daily attendance" />

  
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