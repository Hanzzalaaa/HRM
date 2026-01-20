"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, UserCheck, UserX, Users } from "lucide-react"
import { formatTime, getInitials, getStatusColor } from "@/lib/utils/helpers"

interface AttendanceRecord {
  id: string
  employee_id: string
  date: string
  check_in?: string
  check_out?: string
  status: string
  work_hours?: number
  employees: {
    employee_id: string
    designation: string
    users: { full_name: string; avatar_url?: string }
    departments: { name: string }
  }
}

interface AttendanceViewProps {
  attendance: AttendanceRecord[]
  employees: { id: string; employee_id: string; users: { full_name: string; status: string } }[]
  date: string
}

export function AttendanceView({ attendance, employees, date }: AttendanceViewProps) {
  const [selectedDate, setSelectedDate] = useState(date)

  const stats = {
    total: employees.length,
    present: attendance.filter((a) => a.status === "present").length,
    absent: attendance.filter((a) => a.status === "absent").length,
    late: attendance.filter((a) => a.status === "late").length,
    onLeave: attendance.filter((a) => a.status === "on_leave").length,
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.present}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Late</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.late}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.onLeave}</div>
          </CardContent>
        </Card>
      </div>

      {/* Date Picker and Actions */}
      <div className="flex items-center justify-between">
        <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-48" />
        <Button variant="outline">Export Report</Button>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Work Hours</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendance.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No attendance records for this date.
                  </TableCell>
                </TableRow>
              ) : (
                attendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{getInitials(record.employees.users.full_name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{record.employees.users.full_name}</p>
                          <p className="text-xs text-muted-foreground">{record.employees.designation}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{record.employees.employee_id}</TableCell>
                    <TableCell>{record.employees.departments.name}</TableCell>
                    <TableCell>{record.check_in ? formatTime(record.check_in) : "-"}</TableCell>
                    <TableCell>{record.check_out ? formatTime(record.check_out) : "-"}</TableCell>
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
