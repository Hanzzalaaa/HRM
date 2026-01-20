import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/ui/page-header"
import { EmployeeAttendanceView } from "@/components/attendance/employee-attendance-view"
import { redirect } from "next/navigation"

export default async function EmployeeAttendancePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const employee = await prisma.employee.findUnique({
    where: { user_id: user.id },
    select: { id: true }
  })

  if (!employee) return null

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  const startDate = new Date(`${currentYear}-${String(currentMonth).padStart(2, "0")}-01`)

  const attendance = await prisma.attendance.findMany({
    where: {
      employee_id: employee.id,
      date: {
        gte: startDate
      }
    },
    orderBy: {
      date: 'desc'
    }
  })

  const formattedAttendance = attendance.map((record: any) => ({
    ...record,
    date: record.date.toISOString(),
    check_in: record.check_in?.toISOString() ?? undefined,
    check_out: record.check_out?.toISOString() ?? undefined,
    work_hours: record.work_hours ?? undefined,
    notes: record.notes ?? undefined,
    created_at: record.created_at.toISOString(),
    updated_at: record.updated_at.toISOString()
  }))

  return (
    <div className="space-y-6">
      <PageHeader title="My Attendance" description="View your attendance history" />

      <EmployeeAttendanceView attendance={formattedAttendance} employeeId={employee.id} />
    </div>
  )
}
