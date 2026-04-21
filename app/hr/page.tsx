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
    prisma.employees.count(),
    prisma.employees.count({
      where: {
        users: {
          status: 'active'
        }
      }
    }),
    prisma.leaves.count({
      where: {
        status: 'pending'
      }
    }),
    prisma.attendances.count({
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
  const leaves = await prisma.leaves.findMany({
    where: {
      status: 'pending'
    },
    include: {
      employees: {
        select: {
          employee_id: true,
          users: {
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
      employee_id: leave.employees.employee_id,
      users: leave.employees.users
    }
  }))
}

async function getTodayAbsentees() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const attendance = await prisma.attendances.findMany({
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

  const absentees = await prisma.employees.findMany({
    where: {
      id: {
        notIn: attendedEmployeeIds
      },
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
      },
      departments_employees_department_idTodepartments: {
        select: {
          name: true
        }
      }
    },
    take: 5
  })

  return absentees.map((emp: any) => ({
    ...emp,
    users: emp.users,
    departments: emp.departments_employees_department_idTodepartments
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Employees" value={stats.totalEmployees} icon={Users} description="Active workforce" />
        <StatCard title="Active Employees" value={stats.activeEmployees} icon={UserCheck} description="Currently active" />
        <StatCard title="Today's Attendance" value={`${stats.todayAttendance}/${stats.activeEmployees}`} icon={Clock} description="Present today" />
        <StatCard title="Pending Leaves" value={stats.pendingLeaves} icon={Calendar} description="Awaiting approval" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
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