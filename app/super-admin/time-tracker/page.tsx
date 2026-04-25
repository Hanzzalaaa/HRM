import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, TrendingUp, Users } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function TimeTrackerPage() {
  const now = new Date()
  const localDate = new Date(now.getTime() + (5 * 60 * 60 * 1000))
  const currentMonth = localDate.getUTCMonth() + 1
  const currentYear = localDate.getUTCFullYear()
  const startDate = new Date(`${currentYear}-${String(currentMonth).padStart(2, "0")}-01`)

  // Get all employees with their attendance
  const employees = await prisma.employees.findMany({
    where: {
      users: {
        status: 'active'
      }
    },
    include: {
      users: {
        select: {
          full_name: true,
          avatar_url: true,
          email: true
        }
      },
      departments_employees_department_idTodepartments: {
        select: {
          name: true
        }
      },
      attendances: {
        where: {
          date: { gte: startDate }
        },
        orderBy: { date: 'desc' }
      }
    }
  })

  // Calculate statistics
  const totalEmployees = employees.length
  const totalWorkHours = employees.reduce((sum, emp) => {
    return sum + emp.attendances.reduce((empSum, att) => empSum + (att.work_hours || 0), 0)
  }, 0)
  const avgWorkHours = totalEmployees > 0 ? (totalWorkHours / totalEmployees).toFixed(1) : 0

  // Get today's active employees
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayAttendance = await prisma.attendances.count({
    where: {
      date: today,
      status: { in: ['present', 'late'] }
    }
  })

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Time Tracker" 
        description="Monitor employee work hours and attendance patterns" 
      />

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAttendance}</div>
            <p className="text-xs text-muted-foreground">
              {totalEmployees > 0 ? `${((todayAttendance / totalEmployees) * 100).toFixed(0)}% present` : 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours (Month)</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWorkHours.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Across all employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Hours/Employee</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgWorkHours}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Employee Time Tracking Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Time Records</CardTitle>
          <CardDescription>
            Detailed time tracking for all employees this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Employees</TabsTrigger>
              <TabsTrigger value="active">Active Today</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-3 text-left text-sm font-medium">Employee</th>
                      <th className="p-3 text-left text-sm font-medium">Department</th>
                      <th className="p-3 text-left text-sm font-medium">Days Present</th>
                      <th className="p-3 text-left text-sm font-medium">Total Hours</th>
                      <th className="p-3 text-left text-sm font-medium">Avg Hours/Day</th>
                      <th className="p-3 text-left text-sm font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((employee) => {
                      const daysPresent = employee.attendances.filter(
                        att => att.status === 'present' || att.status === 'late'
                      ).length
                      const totalHours = employee.attendances.reduce(
                        (sum, att) => sum + (att.work_hours || 0), 0
                      )
                      const avgHours = daysPresent > 0 ? (totalHours / daysPresent).toFixed(1) : '0.0'

                      return (
                        <tr key={employee.id} className="border-b">
                          <td className="p-3">
                            <div>
                              <div className="font-medium">{employee.users.full_name}</div>
                              <div className="text-sm text-muted-foreground">{employee.employee_id}</div>
                            </div>
                          </td>
                          <td className="p-3 text-sm">
                            {employee.departments_employees_department_idTodepartments.name}
                          </td>
                          <td className="p-3 text-sm">{daysPresent}</td>
                          <td className="p-3 text-sm font-medium">{totalHours.toFixed(1)} hrs</td>
                          <td className="p-3 text-sm">{avgHours} hrs</td>
                          <td className="p-3">
                            <Badge variant={
                              parseFloat(avgHours) >= 8 ? "default" : 
                              parseFloat(avgHours) >= 6 ? "secondary" : 
                              "destructive"
                            }>
                              {parseFloat(avgHours) >= 8 ? "Good" : 
                               parseFloat(avgHours) >= 6 ? "Average" : 
                               "Low"}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-3 text-left text-sm font-medium">Employee</th>
                      <th className="p-3 text-left text-sm font-medium">Check In</th>
                      <th className="p-3 text-left text-sm font-medium">Check Out</th>
                      <th className="p-3 text-left text-sm font-medium">Hours Worked</th>
                      <th className="p-3 text-left text-sm font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees
                      .filter(emp => {
                        const todayRecord = emp.attendances.find(att => {
                          const attDate = new Date(att.date)
                          attDate.setHours(0, 0, 0, 0)
                          return attDate.getTime() === today.getTime()
                        })
                        return todayRecord && (todayRecord.status === 'present' || todayRecord.status === 'late')
                      })
                      .map((employee) => {
                        const todayRecord = employee.attendances.find(att => {
                          const attDate = new Date(att.date)
                          attDate.setHours(0, 0, 0, 0)
                          return attDate.getTime() === today.getTime()
                        })

                        return (
                          <tr key={employee.id} className="border-b">
                            <td className="p-3">
                              <div>
                                <div className="font-medium">{employee.users.full_name}</div>
                                <div className="text-sm text-muted-foreground">{employee.employee_id}</div>
                              </div>
                            </td>
                            <td className="p-3 text-sm">
                              {todayRecord?.check_in 
                                ? new Date(todayRecord.check_in).toLocaleTimeString('en-US', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })
                                : '-'}
                            </td>
                            <td className="p-3 text-sm">
                              {todayRecord?.check_out 
                                ? new Date(todayRecord.check_out).toLocaleTimeString('en-US', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })
                                : 'Working...'}
                            </td>
                            <td className="p-3 text-sm font-medium">
                              {todayRecord?.work_hours 
                                ? `${todayRecord.work_hours.toFixed(1)} hrs`
                                : '-'}
                            </td>
                            <td className="p-3">
                              <Badge variant={todayRecord?.status === 'present' ? 'default' : 'secondary'}>
                                {todayRecord?.status}
                              </Badge>
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
