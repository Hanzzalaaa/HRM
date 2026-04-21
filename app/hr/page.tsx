import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, UserCheck, Clock, AlertCircle } from "lucide-react"
import { formatDate, getStatusColor, getInitials } from "@/lib/utils/helpers"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"

async function getHRDashboardData() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [totalEmployees, activeEmployees, pendingLeaves, todayAttendance] = await Promise.all([
    prisma.employees.count(),
    prisma.employees.count({
      where: { users: { status: 'active' } }
    }),
    prisma.leaves.count({
      where: { status: 'pending' }
    }),
    prisma.attendances.count({
      where: { date: today, status: 'present' }
    })
  ])

  return { totalEmployees, activeEmployees, pendingLeaves, todayAttendance }
}

async function getPendingLeaves() {
  const leaves = await prisma.leaves.findMany({
    where: { status: 'pending' },
    include: {
      employees: {
        select: {
          employee_id: true,
          users: { select: { full_name: true } }
        }
      }
    },
    orderBy: { created_at: 'desc' },
    take: 5
  })

  return leaves.map((leave: any) => ({
    ...leave,
    start_date: leave.start_date.toISOString(),
    end_date: leave.end_date.toISOString(),
  }))
}

async function getTodayAttendance() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const attendance = await prisma.attendances.findMany({
    where: {
      date: today,
      status: { in: ['present', 'late', 'half_day'] }
    },
    include: {
      employees: {
        select: {
          employee_id: true,
          users: { select: { full_name: true } },
          departments_employees_department_idTodepartments: { select: { name: true } }
        }
      }
    }
  })

  return attendance
}

async function getTodayAbsentees() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const attendance = await prisma.attendances.findMany({
    where: { date: today, status: { in: ['present', 'late', 'half_day'] } },
    select: { employee_id: true }
  })

  const attendedEmployeeIds = attendance.map((a: any) => a.employee_id)

  const absentees = await prisma.employees.findMany({
    where: {
      id: { notIn: attendedEmployeeIds },
      users: { status: 'active' }
    },
    select: {
      id: true,
      employee_id: true,
      users: { select: { full_name: true, status: true } },
      departments_employees_department_idTodepartments: { select: { name: true } }
    },
    take: 5
  })

  return absentees.map((emp: any) => ({
    ...emp,
    departments: emp.departments_employees_department_idTodepartments
  }))
}

export default async function HRDashboard() {
  const [stats, pendingLeaves, absentees, todayAttendance] = await Promise.all([
    getHRDashboardData(),
    getPendingLeaves(),
    getTodayAbsentees(),
    getTodayAttendance(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader title="HR Dashboard" description="Manage employees, attendance, and leave requests" />

      {/* Clickable Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/hr/employees">
          <div className="rounded-lg border bg-card p-6 hover:bg-accent transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Employees</span>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground mt-1">Active workforce</p>
          </div>
        </Link>

        <Link href="/hr/employees?filter=active">
          <div className="rounded-lg border bg-card p-6 hover:bg-accent transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Active Employees</span>
              <UserCheck className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stats.activeEmployees}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently active</p>
          </div>
        </Link>

        <Link href="/hr/attendance">
          <div className="rounded-lg border bg-card p-6 hover:bg-accent transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Today's Attendance</span>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stats.todayAttendance}/{stats.activeEmployees}</div>
            <p className="text-xs text-muted-foreground mt-1">Present today</p>
          </div>
        </Link>

        <Link href="/hr/leaves">
          <div className="rounded-lg border bg-card p-6 hover:bg-accent transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Pending Leaves</span>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stats.pendingLeaves}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
          </div>
        </Link>
      </div>

      {/* Today's Attendance List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today's Attendance
          </CardTitle>
          <CardDescription>Employees who checked in today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todayAttendance.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No attendance marked yet today</p>
            ) : (
              todayAttendance.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(a.employees?.users?.full_name || "E")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{a.employees?.users?.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.employees?.departments_employees_department_idTodepartments?.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className={getStatusColor(a.status)}>
                      {a.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {a.check_in ? new Date(a.check_in).toLocaleTimeString() : "-"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Leaves */}
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
                          {getInitials(leave.employees?.users?.full_name || "E")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{leave.employees?.users?.full_name}</p>
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
                          {getInitials(employee.users?.full_name || "E")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{employee.users?.full_name}</p>
                        <p className="text-xs text-muted-foreground">{employee.departments?.name}</p>
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