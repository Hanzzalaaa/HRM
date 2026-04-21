import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, DollarSign, Bell, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { formatDate, formatCurrency, getStatusColor, getPriorityColor } from "@/lib/utils/helpers"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { redirect } from "next/navigation"

async function getEmployeeData(userId: string) {
  const employee = await prisma.employees.findUnique({
    where: { user_id: userId },
    include: {
      departments_employees_department_idTodepartments: {
        select: { name: true }
      }
    }
  })

  return employee
}

async function getAttendanceStats(employeeId: string) {
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  const startDate = new Date(`${currentYear}-${String(currentMonth).padStart(2, "0")}-01`)

  const attendance = await prisma.attendances.findMany({
    where: {
      employee_id: employeeId,
      date: { gte: startDate }
    },
    select: { status: true }
  })

  const stats = {
    present: attendance.filter((a: any) => a.status === "present").length,
    absent: attendance.filter((a: any) => a.status === "absent").length,
    late: attendance.filter((a: any) => a.status === "late").length,
    leaves: attendance.filter((a: any) => a.status === "on_leave").length,
  }

  return stats
}

async function getLeaveBalance(employeeId: string) {
  const currentYear = new Date().getFullYear()
  const startDate = new Date(`${currentYear}-01-01`)

  const leaves = await prisma.leaves.findMany({
    where: {
      employee_id: employeeId,
      status: "approved",
      start_date: { gte: startDate }
    },
    select: {
      leave_type: true,
      total_days: true
    }
  })

  const annualUsed = leaves.filter((l: any) => l.leave_type === "annual").reduce((sum: number, l: any) => sum + l.total_days, 0)
  const sickUsed = leaves.filter((l: any) => l.leave_type === "sick").reduce((sum: number, l: any) => sum + l.total_days, 0)

  return {
    annualTotal: 20,
    annualUsed,
    annualRemaining: 20 - annualUsed,
    sickTotal: 10,
    sickUsed,
    sickRemaining: 10 - sickUsed,
  }
}

async function getRecentLeaves(employeeId: string) {
  const leaves = await prisma.leaves.findMany({
    where: { employee_id: employeeId },
    orderBy: { created_at: 'desc' },
    take: 5
  })

  return leaves.map((leave: any) => ({
    ...leave,
    start_date: leave.start_date.toISOString(),
    end_date: leave.end_date.toISOString()
  }))
}

async function getLatestSalary(employeeId: string) {
  const salary = await prisma.salaries.findFirst({
    where: { employee_id: employeeId },
    orderBy: [
      { year: 'desc' },
      { month: 'desc' }
    ]
  })

  return salary
}

async function getAnnouncements() {
  const announcements = await prisma.announcements.findMany({
    where: {
      is_active: true,
      target_roles: { has: "employee" }
    },
    orderBy: [
      { priority: 'desc' },
      { created_at: 'desc' }
    ],
    take: 3
  })

  return announcements.map((announcement: any) => ({
    ...announcement,
    published_at: announcement.published_at?.toISOString() ?? undefined
  }))
}

export default async function EmployeeDashboard() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const employee = await getEmployeeData(user.id)
  if (!employee) return null

  const [attendanceStats, leaveBalance, recentLeaves, latestSalary, announcements] = await Promise.all([
    getAttendanceStats(employee.id),
    getLeaveBalance(employee.id),
    getRecentLeaves(employee.id),
    getLatestSalary(employee.id),
    getAnnouncements(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Dashboard"
        description={`${employee.designation} • ${(employee as any).departments_employees_department_idTodepartments?.name}`}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Days Present" value={attendanceStats.present} icon={CheckCircle} description="This month" className="border-l-4 border-l-emerald-500" />
        <StatCard title="Days Absent" value={attendanceStats.absent} icon={XCircle} description="This month" className="border-l-4 border-l-red-500" />
        <StatCard title="Leave Balance" value={leaveBalance.annualRemaining} icon={Calendar} description={`${leaveBalance.annualUsed} used of ${leaveBalance.annualTotal}`} className="border-l-4 border-l-blue-500" />
        <StatCard title="Net Salary" value={latestSalary ? formatCurrency(Number(latestSalary.net_salary)) : "N/A"} icon={DollarSign} description="Last month" className="border-l-4 border-l-amber-500" />
      </div>

      {announcements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Announcements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {announcements.map((announcement: any) => (
                <div key={announcement.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                  <AlertCircle className={`h-5 w-5 mt-0.5 ${announcement.priority === "urgent" ? "text-red-500" : announcement.priority === "high" ? "text-orange-500" : "text-blue-500"}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{announcement.title}</p>
                      <Badge className={getPriorityColor(announcement.priority)}>{announcement.priority}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{announcement.content}</p>
                    {announcement.published_at && (
                      <p className="text-xs text-muted-foreground mt-2">{formatDate(announcement.published_at)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Leave Balance</CardTitle>
              <CardDescription>Your annual leave entitlement</CardDescription>
            </div>
            <Link href="/employee/leaves">
              <Button size="sm">Apply Leave</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Annual Leave</span>
                <span className="text-sm text-muted-foreground">{leaveBalance.annualRemaining} / {leaveBalance.annualTotal} days</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(leaveBalance.annualRemaining / leaveBalance.annualTotal) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Sick Leave</span>
                <span className="text-sm text-muted-foreground">{leaveBalance.sickRemaining} / {leaveBalance.sickTotal} days</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(leaveBalance.sickRemaining / leaveBalance.sickTotal) * 100}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Leave Requests
            </CardTitle>
            <CardDescription>Your latest leave applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentLeaves.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No leave requests yet</p>
              ) : (
                recentLeaves.map((leave: any) => (
                  <div key={leave.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <p className="text-sm font-medium capitalize">{leave.leave_type.replace("_", " ")} Leave</p>
                      <p className="text-xs text-muted-foreground">{formatDate(leave.start_date)} - {formatDate(leave.end_date)} ({leave.total_days} days)</p>
                    </div>
                    <Badge className={getStatusColor(leave.status)}>{leave.status}</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Attendance Summary - This Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">{attendanceStats.present}</p>
                <p className="text-sm text-muted-foreground">Present</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950/30">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{attendanceStats.absent}</p>
                <p className="text-sm text-muted-foreground">Absent</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{attendanceStats.late}</p>
                <p className="text-sm text-muted-foreground">Late</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{attendanceStats.leaves}</p>
                <p className="text-sm text-muted-foreground">On Leave</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}