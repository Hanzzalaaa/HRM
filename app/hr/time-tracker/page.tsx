import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/ui/page-header"
import { redirect } from "next/navigation"
import { HRTimeTrackerView } from "@/components/attendance/hr-time-tracker-view"
import { EmployeeAttendanceView } from "@/components/attendance/employee-attendance-view"

export default async function HRTimeTrackerPage() {
  const user = await getCurrentUser()

  if (!user || !["super_admin", "hr"].includes(user.role)) {
    redirect("/auth/login")
  }

  const now = new Date()
  const today = now.toISOString().split("T")[0]

  // HR ka apna employee record
  const hrEmployee = await prisma.employees.findUnique({
    where: { user_id: user.id },
    select: { id: true, employment_type: true }
  })

  // HR ki apni attendance
  let hrAttendance: any[] = []
  if (hrEmployee) {
    const startDate = new Date(`${today.slice(0, 7)}-01`)
    const raw = await prisma.attendances.findMany({
      where: {
        employee_id: hrEmployee.id,
        date: { gte: startDate }
      },
      orderBy: { date: "desc" }
    })
    hrAttendance = raw.map((r: any) => ({
      ...r,
      date: r.date.toISOString(),
      check_in: r.check_in?.toISOString() ?? undefined,
      check_out: r.check_out?.toISOString() ?? undefined,
      work_hours: r.work_hours ?? undefined,
      notes: r.notes ?? undefined,
      created_at: r.created_at.toISOString(),
      updated_at: r.updated_at.toISOString(),
    }))
  }

  const shiftHours = hrEmployee?.employment_type === "part_time" ? 4 : 9

  // Saare employees ki aaj ki attendance
  const todayAttendance = await prisma.attendances.findMany({
    where: {
      date: { gte: new Date(today) }
    },
    include: {
      employees: {
        select: {
          id: true,
          employment_type: true,
          users: { select: { full_name: true } }
        }
      }
    },
    orderBy: { check_in: "asc" }
  })

  const formatted = todayAttendance.map((record: any) => ({
    id: record.id,
    employeeName: record.employees?.users?.full_name ?? "Unknown",
    employmentType: record.employees?.employment_type ?? "full_time",
    date: record.date.toISOString(),
    check_in: record.check_in?.toISOString() ?? undefined,
    check_out: record.check_out?.toISOString() ?? undefined,
    status: record.status,
    work_hours: record.work_hours ?? undefined,
  }))

  return (
    <div className="space-y-6">
      <PageHeader title="Time Tracker" description="Track your hours and monitor team attendance" />

      {/* HR ka apna check in/out */}
      {hrEmployee && (
        <div>
          <h2 className="text-lg font-semibold mb-3">My Attendance</h2>
          <EmployeeAttendanceView
            attendance={hrAttendance}
            employeeId={hrEmployee.id}
            shiftHours={shiftHours}
          />
        </div>
      )}

      {/* Team ka overview */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Team Overview</h2>
        <HRTimeTrackerView records={formatted} />
      </div>
    </div>
  )
}