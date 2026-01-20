import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, UserCheck, Clock, AlertCircle } from "lucide-react"
import { formatDate, getStatusColor, getInitials } from "@/lib/utils/helpers"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

async function getHRDashboardData() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [totalEmployees, activeEmployees, pendingLeaves, todayAttendance] = await Promise.all([
    prisma.employee.count(),
    prisma.employee.count({
      where: {
        user: {
          status: 'active'
        }
      }
    }),
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
    })
  ])

  return {
    totalEmployees,
    activeEmployees,
    pendingLeaves,
    todayAttendance
  }
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

async function getTodayAbsentees() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Get employees who attended today
  const attendance = await prisma.attendance.findMany({
    where: {
      date: today,
      status: {
        in: ['present', 'late', 'half_day']
      }
    },
    select: {
      employee_id: true
    }
  })

  const attendedEmployeeIds = attendance.map((a: any) => a.employee_id)

  // Get active employees who didn't attend
  const absentees = await prisma.employee.findMany({
    where: {
      id: {
        notIn: attendedEmployeeIds
      },
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
      },
      department: {
        select: {
          name: true
        }
      }
    },
    take: 5
  })

  return absentees.map((emp: any) => ({
    ...emp,
    users: emp.user,
    departments: emp.department
  }))
}

export default async function HRDashboard() {
  const [stats, pendingLeaves, absentees] = await Promise.all([
    getHRDashboardData(),
    getPendingLeaves(),
    getTodayAbsentees(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader title="HR Dashboard" description="Manage employees, attendance, and leave requests" />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Employees" value={stats.totalEmployees} icon={Users} description="Active workforce" />
        <StatCard
          title="Active Employees"
          value={stats.activeEmployees}
          icon={UserCheck}
          description="Currently active"
        />
        <StatCard
          title="Today's Attendance"
          value={`${stats.todayAttendance}/${stats.activeEmployees}`}
          icon={Clock}
          description="Present today"
        />
        <StatCard title="Pending Leaves" value={stats.pendingLeaves} icon={Calendar} description="Awaiting approval" />
      </div>

      {/* Pending Leaves and Absentees */}
      <div className="grid gap-6 lg:grid-cols-2">
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

        {/* Today's Absentees */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {"Today's Absentees"}
            </CardTitle>
            <CardDescription>Employees not marked present today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {absentees.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">All employees are present!</p>
              ) : (
                absentees.map((employee: any) => (
                  <div key={employee.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getInitials((employee.users as { full_name: string })?.full_name || "E")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{(employee.users as { full_name: string })?.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(employee.departments as { name: string })?.name}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">{employee.employee_id}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
