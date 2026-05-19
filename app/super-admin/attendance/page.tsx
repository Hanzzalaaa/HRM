import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/ui/page-header"
import { AttendanceView } from "@/components/attendance/attendance-view"

export const dynamic = 'force-dynamic'

export default async function AttendancePage() {
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
          users: {
            select: {
              full_name: true,
              avatar_url: true
            }
          },
          departments_employees_department_idTodepartments: {
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
      employee_id: att.employees.employee_id,
      designation: att.employees.designation,
      users: {
        full_name: att.employees.users.full_name,
        avatar_url: att.employees.users.avatar_url ?? undefined
      },
      departments: att.employees.departments_employees_department_idTodepartments
    }
  }))

  const employees = employeesData.map((emp: any) => ({
    ...emp,
    users: emp.users
  }))

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance" description="Track and manage daily attendance" />

      <AttendanceView attendance={attendance} employees={employees} date={today.toISOString().split("T")[0]} />
    </div>
  )
}