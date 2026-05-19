import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getInitials } from "@/lib/utils/helpers"
import { 
  Users, 
  Building2, 
  TrendingUp, 
  DollarSign, 
  UserCheck, 
  Calendar,
  AlertCircle,
  Activity,
  Clock,
  Briefcase,
  LogIn,
  LogOut
} from "lucide-react"

export const dynamic = 'force-dynamic'

async function getDashboardStats() {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  const today = new Date(now.setHours(0, 0, 0, 0))
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)

  const [
    totalEmployees,
    activeEmployees,
    totalDepartments,
    todayAttendance,
    pendingLeaves,
    currentMonthSalaries,
    recentActivities,
    departmentStats,
    monthlyFinancials,
    employmentTypeStats,
    recentCheckIns,
    recentCheckOuts
  ] = await Promise.all([
    prisma.employees.count(),
    prisma.employees.count({ where: { users: { status: 'active' } } }),
    prisma.departments.count(),
    prisma.attendances.findMany({
      where: { date: { gte: today, lt: tomorrow } },
      include: { employees: { include: { users: true } } }
    }),
    prisma.leaves.count({ where: { status: 'pending' } }),
    prisma.salaries.findMany({ where: { month: currentMonth, year: currentYear } }),
    prisma.activity_logs.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      include: { users: { select: { full_name: true, email: true, role: true } } }
    }),
    prisma.departments.findMany({
      include: {
        _count: { select: { employees_employees_department_idTodepartments: true } },
        employees_departments_head_idToemployees: { include: { users: true } }
      }
    }),
    prisma.company_financials.findFirst({ where: { month: currentMonth, year: currentYear } }),
    prisma.employees.groupBy({ by: ['employment_type'], _count: true }),
    prisma.attendances.findMany({
      where: { date: { gte: today, lt: tomorrow }, check_in: { not: null } },
      orderBy: { check_in: 'desc' },
      take: 10,
      include: { employees: { include: { users: true } } }
    }),
    prisma.attendances.findMany({
      where: { date: { gte: today, lt: tomorrow }, check_out: { not: null } },
      orderBy: { check_out: 'desc' },
      take: 10,
      include: { employees: { include: { users: true } } }
    })
  ])

  const presentCount = todayAttendance.filter(a => a.status === 'present').length
  const absentCount = todayAttendance.filter(a => a.status === 'absent').length
  const lateCount = todayAttendance.filter(a => a.status === 'late').length
  const totalSalaryPaid = currentMonthSalaries.filter(s => s.payment_status === 'paid').reduce((sum, s) => sum + s.net_salary, 0)
  const pendingSalaries = currentMonthSalaries.filter(s => s.payment_status === 'pending').length

  return {
    totalEmployees,
    activeEmployees,
    inactiveEmployees: totalEmployees - activeEmployees,
    totalDepartments,
    attendance: { present: presentCount, absent: absentCount, late: lateCount, total: todayAttendance.length },
    leaves: { pending: pendingLeaves },
    salaries: { totalPaid: totalSalaryPaid, pending: pendingSalaries, total: currentMonthSalaries.length },
    recentActivities: recentActivities.map(log => ({ ...log, created_at: log.created_at.toISOString() })),
    departments: departmentStats.map(dept => ({
      id: dept.id,
      name: dept.name,
      employeeCount: dept._count.employees_employees_department_idTodepartments,
      head: dept.employees_departments_head_idToemployees?.users.full_name || 'Not assigned'
    })),
    financials: monthlyFinancials,
    employmentTypes: employmentTypeStats,
    checkIns: recentCheckIns.map(att => ({
      id: att.id,
      employeeName: att.employees.users.full_name,
      employeeId: att.employees.employee_id,
      checkInTime: att.check_in?.toISOString(),
      status: att.status
    })),
    checkOuts: recentCheckOuts.map(att => ({
      id: att.id,
      employeeName: att.employees.users.full_name,
      employeeId: att.employees.employee_id,
      checkOutTime: att.check_out?.toISOString(),
      workHours: att.work_hours,
      status: att.status
    }))
  }
}

export default async function SuperAdminDashboard() {
  const stats = await getDashboardStats()
  const attendanceRate = stats.totalEmployees > 0 ? ((stats.attendance.present / stats.totalEmployees) * 100).toFixed(1) : 0

  return (
    <div className="space-y-8">
      <PageHeader title="Super Admin Dashboard" description="Complete overview of your organization's performance and metrics" />

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600 font-medium">{stats.activeEmployees} active</span>
              {stats.inactiveEmployees > 0 && <span className="text-muted-foreground"> • {stats.inactiveEmployees} inactive</span>}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">{stats.attendance.present} present</span>
              {stats.attendance.absent > 0 && <span className="text-red-600"> • {stats.attendance.absent} absent</span>}
              {stats.attendance.late > 0 && <span className="text-orange-600"> • {stats.attendance.late} late</span>}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.leaves.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.leaves.pending > 0 ? <span className="text-orange-600">Requires attention</span> : <span className="text-green-600">All caught up</span>}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salary Status</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(stats.salaries.totalPaid / 100000).toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.salaries.pending > 0 ? <span className="text-orange-600">{stats.salaries.pending} pending</span> : <span className="text-green-600">All paid</span>}
              <span className="text-muted-foreground"> • {stats.salaries.total} total</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDepartments}</div>
            <p className="text-xs text-muted-foreground mt-1">Active departments</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employment Mix</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {stats.employmentTypes.map((type) => (
                <div key={type.employment_type} className="flex justify-between text-sm">
                  <span className="text-muted-foreground capitalize">{type.employment_type.replace('_', ' ')}</span>
                  <span className="font-medium">{type._count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {stats.financials && (
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Financials</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Revenue</span>
                  <span className="font-medium text-green-600">₹{(stats.financials.total_revenue / 100000).toFixed(1)}L</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Expenses</span>
                  <span className="font-medium text-red-600">₹{(stats.financials.total_expenses / 100000).toFixed(1)}L</span>
                </div>
                <div className="flex justify-between text-sm pt-1 border-t">
                  <span className="text-muted-foreground font-medium">Net Profit</span>
                  <span className={`font-bold ${stats.financials.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{(stats.financials.net_profit / 100000).toFixed(1)}L
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Check-In & Check-Out */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5 text-green-600" />
              Recent Check-Ins
            </CardTitle>
            <CardDescription>Latest employee check-ins today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.checkIns.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No check-ins yet today</p>
              ) : (
                stats.checkIns.map((checkIn) => (
                  <div key={checkIn.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-xs bg-green-100 text-green-700">
                          {getInitials(checkIn.employeeName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{checkIn.employeeName}</p>
                        <p className="text-xs text-muted-foreground">ID: {checkIn.employeeId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">
                        {checkIn.checkInTime ? new Date(checkIn.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </p>
                      <Badge variant={checkIn.status === 'late' ? 'destructive' : 'default'} className="text-xs mt-1">
                        {checkIn.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-blue-600" />
              Recent Check-Outs
            </CardTitle>
            <CardDescription>Latest employee check-outs today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.checkOuts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No check-outs yet today</p>
              ) : (
                stats.checkOuts.map((checkOut) => (
                  <div key={checkOut.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                          {getInitials(checkOut.employeeName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{checkOut.employeeName}</p>
                        <p className="text-xs text-muted-foreground">ID: {checkOut.employeeId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-blue-600">
                        {checkOut.checkOutTime ? new Date(checkOut.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </p>
                      {checkOut.workHours && <p className="text-xs text-muted-foreground mt-1">{checkOut.workHours.toFixed(1)}h worked</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department & Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Department Overview
            </CardTitle>
            <CardDescription>Employee distribution across departments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.departments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No departments found</p>
              ) : (
                stats.departments.map((dept) => (
                  <div key={dept.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{dept.name}</p>
                      <p className="text-xs text-muted-foreground">Head: {dept.head}</p>
                    </div>
                    <Badge variant="secondary" className="ml-auto">
                      {dept.employeeCount} {dept.employeeCount === 1 ? 'employee' : 'employees'}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest system activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No recent activities</p>
              ) : (
                stats.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 mt-0.5">
                      <AvatarFallback className="text-xs">{getInitials(activity.users?.full_name || "U")}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{activity.users?.full_name}</p>
                        <Badge variant="outline" className="text-xs">{activity.action}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {activity.entity_type}{activity.entity_id && ` • ${activity.entity_id.slice(0, 8)}`}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Alert */}
      {(stats.leaves.pending > 0 || stats.salaries.pending > 0) && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-100">
              <AlertCircle className="h-5 w-5" />
              Action Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-orange-800 dark:text-orange-200">
              {stats.leaves.pending > 0 && <p>• {stats.leaves.pending} leave request{stats.leaves.pending > 1 ? 's' : ''} pending approval</p>}
              {stats.salaries.pending > 0 && <p>• {stats.salaries.pending} salary payment{stats.salaries.pending > 1 ? 's' : ''} pending</p>}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
