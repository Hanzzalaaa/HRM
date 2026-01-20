import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, Calendar, DollarSign, TrendingUp, UserCheck, Clock, AlertCircle } from "lucide-react"
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils/helpers"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils/helpers"

async function getDashboardStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const [totalEmployees, activeEmployees, totalDepartments, pendingLeaves, todayAttendance, salaries, financials] =
    await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({
        where: {
          user: {
            status: 'active'
          }
        }
      }),
      prisma.department.count(),
      prisma.leave.count({
        where: {
          status: 'pending'
        }
      }),
      prisma.attendance.count({
        where: {
          date: today,
          status: 'present'
        }
      }),
      prisma.salary.findMany({
        where: {
          month: currentMonth,
          year: currentYear
        },
        select: {
          net_salary: true
        }
      }),
      prisma.companyFinancials.findFirst({
        where: {
          month: currentMonth,
          year: currentYear
        }
      })
    ])

  const monthlyPayroll = salaries.reduce((sum: number, s: any) => sum + Number(s.net_salary), 0)
  const monthlyRevenue = financials?.total_revenue || 0
  const monthlyProfit = financials?.net_profit || 0

  return {
    totalEmployees,
    activeEmployees,
    totalDepartments,
    pendingLeaves,
    todayAttendance,
    monthlyPayroll,
    monthlyRevenue,
    monthlyProfit,
  }
}

async function getRecentActivity() {
  const activities = await prisma.activityLog.findMany({
    include: {
      user: {
        select: {
          full_name: true,
          avatar_url: true
        }
      }
    },
    orderBy: {
      created_at: 'desc'
    },
    take: 5
  })

  return activities.map((activity: any) => ({
    ...activity,
    created_at: activity.created_at.toISOString(),
    users: activity.user
  }))
}

async function getPendingLeaves() {
  const leaves = await prisma.leave.findMany({
    where: {
      status: 'pending'
    },
    include: {
      employee: {
        select: {
          employee_id: true,
          user: {
            select: {
              full_name: true
            }
          }
        }
      }
    },
    orderBy: {
      created_at: 'desc'
    },
    take: 5
  })

  return leaves.map((leave: any) => ({
    ...leave,
    start_date: leave.start_date.toISOString(),
    end_date: leave.end_date.toISOString(),
    employees: {
      employee_id: leave.employee.employee_id,
      users: leave.employee.user
    }
  }))
}

async function getRecentEmployees() {
  const employees = await prisma.employee.findMany({
    include: {
      user: {
        select: {
          full_name: true,
          email: true,
          avatar_url: true,
          status: true
        }
      },
      department: {
        select: {
          name: true
        }
      }
    },
    orderBy: {
      created_at: 'desc'
    },
    take: 5
  })

  return employees.map((emp: any) => ({
    ...emp,
    date_of_joining: emp.date_of_joining.toISOString(),
    users: emp.user,
    departments: emp.department
  }))
}

export default async function SuperAdminDashboard() {
  const [stats, recentActivity, pendingLeaves, recentEmployees] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(),
    getPendingLeaves(),
    getRecentEmployees(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Welcome to the Revolix Technology HRM System" />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Employees" value={stats.totalEmployees} icon={Users} description="Active workforce" />
        <StatCard
          title="Departments"
          value={stats.totalDepartments}
          icon={Briefcase}
          description="Organizational units"
        />
        <StatCard
          title="Today's Attendance"
          value={`${stats.todayAttendance}/${stats.activeEmployees}`}
          icon={UserCheck}
          description="Present today"
        />
        <StatCard title="Pending Leaves" value={stats.pendingLeaves} icon={Calendar} description="Awaiting approval" />
      </div>

      {/* Financial Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Monthly Payroll"
          value={formatCurrency(stats.monthlyPayroll)}
          icon={DollarSign}
          description="Total salary expenses"
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(stats.monthlyRevenue)}
          icon={TrendingUp}
          description="Total revenue this month"
        />
        <StatCard
          title="Net Profit"
          value={formatCurrency(stats.monthlyProfit)}
          icon={TrendingUp}
          description="After all expenses"
          trend={stats.monthlyProfit > 0 ? { value: 12.5, isPositive: true } : undefined}
        />
      </div>

      {/* Activity and Pending Items */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest actions in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
              ) : (
                recentActivity.map((activity: any) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getInitials((activity.users as { full_name: string })?.full_name || "U")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {(activity.users as { full_name: string })?.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.action} - {activity.entity_type}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(activity.created_at)}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Leave Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Pending Leave Requests
            </CardTitle>
            <CardDescription>Awaiting your approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingLeaves.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No pending leave requests</p>
              ) : (
                pendingLeaves.map((leave: any) => (
                  <div key={leave.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getInitials((leave.employees as { users: { full_name: string } })?.users?.full_name || "E")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {(leave.employees as { users: { full_name: string } })?.users?.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className={getStatusColor(leave.leave_type)}>
                      {leave.leave_type.replace("_", " ")}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Employees */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recent Employees
          </CardTitle>
          <CardDescription>Newly joined team members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentEmployees.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No employees found</p>
            ) : (
              recentEmployees.map((employee: any) => (
                <div key={employee.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {getInitials((employee.users as { full_name: string })?.full_name || "E")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{(employee.users as { full_name: string })?.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {employee.designation} • {(employee.departments as { name: string })?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={getStatusColor((employee.users as { status: string })?.status)}
                    >
                      {(employee.users as { status: string })?.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(employee.date_of_joining)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
