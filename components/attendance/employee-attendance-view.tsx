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
  shiftHours?: number
}

export function EmployeeAttendanceView({ attendance, employeeId, shiftHours = 9 }: EmployeeAttendanceViewProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const today = new Date().toISOString().split("T")[0]
  const todayRecord = attendance.find((a) => {
    const recordDate = a.date.split("T")[0]
    return recordDate === today
  })

  const handleCheckIn = async () => {
    setLoading(true)
    try {
      const now = new Date()
      const timeString = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:00`
      const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 30) // ✅ Fixed

      await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

      let workHours = 0
      if (todayRecord.check_in) {
        const checkInDate = new Date(todayRecord.check_in)
        const diffMs = now.getTime() - checkInDate.getTime()
        workHours = Math.round((diffMs / 3600000) * 100) / 100
      }

      const halfDayThreshold = shiftHours / 2

      await fetch(`/api/attendance/${todayRecord.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          check_out: timeString,
          work_hours: workHours,
          status: workHours < halfDayThreshold ? "half_day" : todayRecord.status,
        }),
      })

      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
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
            {todayRecord?.check_in ? (
              <WorkTimer 
                checkInTime={todayRecord.check_in}
                checkOutTime={todayRecord.check_out ?? undefined}
                shiftHours={shiftHours}
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
    </div>
  )
}