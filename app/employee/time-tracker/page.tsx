import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/ui/page-header"
import { EmployeeAttendanceView } from "@/components/attendance/employee-attendance-view"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function TimeTrackerPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const employee = await prisma.employees.findUnique({
    where: { user_id: user.id },
    select: { id: true, employment_type: true }
  })

  if (!employee) {
    return (
      <div className="space-y-6">
        <PageHeader title="Time Tracker" description="Track your daily work hours" />
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-3 text-center">
          <h2 className="text-xl font-semibold">Employee Profile Not Found</h2>
          <p className="text-muted-foreground max-w-sm">
            Your account doesn&apos;t have an employee profile linked yet. Please contact HR.
          </p>
        </div>
      </div>
    )
  }

  const now = new Date()
  const localDate = new Date(now.getTime() + (5 * 60 * 60 * 1000))
  const currentMonth = localDate.getUTCMonth() + 1
  const currentYear = localDate.getUTCFullYear()
  const startDate = new Date(`${currentYear}-${String(currentMonth).padStart(2, "0")}-01`)

  const attendance = await prisma.attendances.findMany({
    where: {
      employee_id: employee.id,
      date: { gte: startDate }
    },
    orderBy: { date: 'desc' }
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

  const shiftHours = employee.employment_type === "part_time" ? 4 : 9

  return (
    <div className="space-y-6">
      <PageHeader title="Time Tracker" description="Track your daily work hours" />
      <EmployeeAttendanceView 
        attendance={formattedAttendance} 
        employeeId={employee.id}
        shiftHours={shiftHours}
      />
    </div>
  )
}