import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/ui/page-header"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDate, formatTime, getStatusColor } from "@/lib/utils/helpers"

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

  return (
    <div className="space-y-6">
      <PageHeader title="My Attendance" description="View your attendance history" />

      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>This month</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Work Hours</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendance.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No attendance records this month.
                  </TableCell>
                </TableRow>
              ) : (
                attendance.map((record: any) => (
                  <TableRow key={record.id}>
                    <TableCell>{formatDate(record.date.toISOString())}</TableCell>
                    <TableCell>{record.check_in ? formatTime(record.check_in.toISOString()) : "-"}</TableCell>
                    <TableCell>{record.check_out ? formatTime(record.check_out.toISOString()) : "-"}</TableCell>
                    <TableCell>{record.work_hours ? `${record.work_hours.toFixed(1)}h` : "-"}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(record.status)}>{record.status.replace("_", " ")}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}