"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, LogIn, LogOut, Loader2 } from "lucide-react"
import { formatDate, formatTime, getStatusColor } from "@/lib/utils/helpers"
import { WorkTimer } from "@/components/attendance/work-timer"

interface AttendanceRecord {
  id: string
  date: string
  check_in?: string
  check_out?: string
  status: string
  work_hours?: number
}

interface EmployeeAttendanceViewProps {
  attendance: AttendanceRecord[]
  employeeId: string
}

export function EmployeeAttendanceView({ attendance, employeeId }: EmployeeAttendanceViewProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const today = new Date().toISOString().split("T")[0]
  const todayRecord = attendance.find((a) => {
    const recordDate = a.date.split("T")[0]
    return recordDate === today
  })

  console.log('EmployeeAttendanceView:', {
    today,
    todayRecord,
    attendanceCount: attendance.length,
    firstRecord: attendance[0]
  })

  const handleCheckIn = async () => {
    setLoading(true)
    try {
      const now = new Date()
      const timeString = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:00`
      const isLate = now.getHours() >= 10 // Consider late if after 10 AM

      await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_id: employeeId,
          date: today,
          check_in: timeString,
          status: isLate ? "late" : "present",
        }),
      })

      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  const handleCheckOut = async () => {
    if (!todayRecord) return

    setLoading(true)
    try {
      const now = new Date()
      const timeString = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:00`

      // Calculate work hours
      let workHours = 0
      if (todayRecord.check_in) {
        const [inHours, inMinutes] = todayRecord.check_in.split(":").map(Number)
        const inTime = inHours * 60 + inMinutes
        const outTime = now.getHours() * 60 + now.getMinutes()
        workHours = Math.round(((outTime - inTime) / 60) * 100) / 100
      }

      await fetch(`/api/attendance/${todayRecord.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          check_out: timeString,
          work_hours: workHours,
          status: workHours < 4.5 ? "half_day" : todayRecord.status, // Less than 4.5 hours is half day
        }),
      })

      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Check In/Out Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {"Today's Attendance"}
          </CardTitle>
          <CardDescription>{formatDate(today)}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Timer Display or Prompt */}
            {todayRecord?.check_in ? (
              <WorkTimer 
                checkInTime={`${todayRecord.date.split('T')[0]}T${todayRecord.check_in}`} 
                checkOutTime={todayRecord.check_out ? `${todayRecord.date.split('T')[0]}T${todayRecord.check_out}` : undefined}
              />
            ) : (
              <div className="rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/20 p-6 text-center">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-lg font-semibold text-muted-foreground">Not Checked In Yet</p>
                <p className="text-sm text-muted-foreground/75 mt-1">
                  Click the "Check In" button below to start your work timer
                </p>
              </div>
            )}

            {/* Check In/Out Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground">Check In</p>
                  <p className="text-xl font-semibold mt-1">
                    {todayRecord?.check_in ? formatTime(todayRecord.check_in) : "--:--"}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground">Check Out</p>
                  <p className="text-xl font-semibold mt-1">
                    {todayRecord?.check_out ? formatTime(todayRecord.check_out) : "--:--"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {!todayRecord ? (
                  <Button onClick={handleCheckIn} disabled={loading} size="lg" className="min-w-[140px]">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                    Check In
                  </Button>
                ) : !todayRecord.check_out ? (
                  <Button onClick={handleCheckOut} disabled={loading} variant="secondary" size="lg" className="min-w-[140px]">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
                    Check Out
                  </Button>
                ) : (
                  <Badge className={`${getStatusColor(todayRecord.status)} text-base px-4 py-2`}>
                    {todayRecord.status.replace("_", " ")} - {todayRecord.work_hours?.toFixed(1)}h
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance History */}
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
                attendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{formatDate(record.date)}</TableCell>
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
