import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/ui/page-header"
import { redirect } from "next/navigation"
import { EmployeeAttendanceView } from "@/components/attendance/employee-attendance-view"

export const dynamic = 'force-dynamic'

export default async function EmployeeAttendancePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const employee = await prisma.employees.findUnique({
    where: { user_id: user.id },
    select: { id: true }
  })

  if (!employee) return null

  // ✅ PKT (UTC+5) mein aaj ki date
  const now = new Date()
  const pktNow = new Date(now.getTime() + (5 * 60 * 60 * 1000))
  const pktYear = pktNow.getUTCFullYear()
  const pktMonth = pktNow.getUTCMonth() + 1
  const startDate = new Date(`${pktYear}-${String(pktMonth).padStart(2, "0")}-01`)

  const attendance = await prisma.attendances.findMany({
    where: {
      employee_id: employee.id,
      date: { gte: startDate }
    },
    orderBy: { date: 'desc' }
  })

  const formattedAttendance = attendance.map((record: any) => ({
    id: record.id,
    date: record.date.toISOString(),
    check_in: record.check_in?.toISOString() ?? undefined,
    check_out: record.check_out?.toISOString() ?? undefined,
    status: record.status,
    work_hours: record.work_hours ?? undefined,
  }))

  return (
    <div className="space-y-6">
      <PageHeader title="My Attendance" description="View your attendance history" />
      <EmployeeAttendanceView
        attendance={formattedAttendance}
        employeeId={employee.id}
        shiftHours={9}
      />
    </div>
  )
}