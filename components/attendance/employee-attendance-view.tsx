"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, LogIn, LogOut, Loader2, AlertCircle, CalendarDays, Lock } from "lucide-react"
import { formatDate, formatTime, getStatusColor } from "@/lib/utils/helpers"
import { WorkTimer } from "@/components/attendance/work-timer"

const MIN_WORK_SECONDS = 3 * 60 * 60 // 3 hours — checkout locked until this elapses

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
  const [error, setError] = useState<string | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  const today = new Date().toLocaleDateString("en-CA") // YYYY-MM-DD in local time
  const todayRecord = attendance.find((a) => a.date.split("T")[0] === today)

  // Tick every second while checked in but not yet checked out
  useEffect(() => {
    if (!todayRecord?.check_in || todayRecord.check_out) return

    const checkInDate = new Date(todayRecord.check_in)

    const update = () => {
      const diff = Math.floor((Date.now() - checkInDate.getTime()) / 1000)
      setElapsedSeconds(Math.max(0, diff))
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [todayRecord?.check_in, todayRecord?.check_out])

  const lockSecondsRemaining = Math.max(MIN_WORK_SECONDS - elapsedSeconds, 0)
  const checkOutLocked = lockSecondsRemaining > 0

  const formatCountdown = (secs: number) => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    return `${m}:${String(s).padStart(2, "0")}`
  }

  const handleCheckIn = async () => {
    setLoading(true)
    setError(null)
    try {
      const now = new Date()
      const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 30)

      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: employeeId,
          date: today,
          status: isLate ? "late" : "present",
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to check in. Please try again.")
        return
      }

      router.refresh()
    } catch {
      setError("Could not connect to the server. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }

  const handleCheckOut = async () => {
    if (!todayRecord || checkOutLocked) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/attendance/${todayRecord.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: todayRecord.status }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to check out. Please try again.")
        return
      }

      router.refresh()
    } catch {
      setError("Could not connect to the server. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    present:    attendance.filter((a) => a.status === "present").length,
    late:       attendance.filter((a) => a.status === "late").length,
    onLeave:    attendance.filter((a) => a.status === "on_leave").length,
    totalHours: attendance.reduce((sum, a) => sum + (a.work_hours ?? 0), 0),
  }

  return (
    <div className="space-y-6">

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Today's card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {"Today's Attendance"}
          </CardTitle>
          <CardDescription>{formatDate(today)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Live timer or placeholder */}
          {todayRecord?.check_in ? (
            <WorkTimer
              checkInTime={todayRecord.check_in}
              checkOutTime={todayRecord.check_out ?? undefined}
              shiftHours={shiftHours}
            />
          ) : (
            <div className="rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/20 p-8 text-center">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-lg font-semibold text-muted-foreground">Not Checked In Yet</p>
              <p className="text-sm text-muted-foreground/75 mt-1">
                Click "Check In" below to start your work timer
              </p>
            </div>
          )}

          {/* Times + action button */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 grid grid-cols-2 gap-4 w-full">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Check In</p>
                <p className="text-xl font-semibold">
                  {todayRecord?.check_in ? formatTime(todayRecord.check_in) : "--:--"}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Check Out</p>
                <p className="text-xl font-semibold">
                  {todayRecord?.check_out ? formatTime(todayRecord.check_out) : "--:--"}
                </p>
              </div>
            </div>

            <div className="shrink-0 text-center space-y-1.5">
              {/* No record — Check In */}
              {!todayRecord && (
                <Button onClick={handleCheckIn} disabled={loading} size="lg" className="min-w-[160px]">
                  {loading
                    ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    : <LogIn className="mr-2 h-4 w-4" />}
                  Check In
                </Button>
              )}

              {/* Checked in, not yet checked out */}
              {todayRecord && !todayRecord.check_out && (
                <>
                  <Button
                    onClick={handleCheckOut}
                    disabled={loading || checkOutLocked}
                    variant="secondary"
                    size="lg"
                    className="min-w-[160px]"
                  >
                    {loading
                      ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      : checkOutLocked
                        ? <Lock className="mr-2 h-4 w-4" />
                        : <LogOut className="mr-2 h-4 w-4" />}
                    Check Out
                  </Button>

                  {checkOutLocked && (
                    <p className="text-xs text-muted-foreground">
                      Available in{" "}
                      <span className="font-semibold tabular-nums text-foreground">
                        {formatCountdown(lockSecondsRemaining)}
                      </span>
                    </p>
                  )}
                </>
              )}

              {/* Already checked out */}
              {todayRecord?.check_out && (
                <div className="space-y-1">
                  <Badge className={`${getStatusColor(todayRecord.status)} text-sm px-4 py-1.5`}>
                    {todayRecord.status.replace("_", " ")}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {todayRecord.work_hours?.toFixed(1)}h worked today
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{stats.present}</p>
            <p className="text-xs text-muted-foreground mt-1">Present</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{stats.late}</p>
            <p className="text-xs text-muted-foreground mt-1">Late</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.onLeave}</p>
            <p className="text-xs text-muted-foreground mt-1">On Leave</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <p className="text-2xl font-bold text-primary">{stats.totalHours.toFixed(1)}h</p>
            <p className="text-xs text-muted-foreground mt-1">Total Hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly history table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            This Month's History
          </CardTitle>
          <CardDescription>Your attendance log for the current month</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendance.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No attendance records this month yet.
                  </TableCell>
                </TableRow>
              ) : (
                attendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{formatDate(record.date)}</TableCell>
                    <TableCell>{record.check_in ? formatTime(record.check_in) : "--:--"}</TableCell>
                    <TableCell>{record.check_out ? formatTime(record.check_out) : "--:--"}</TableCell>
                    <TableCell>
                      {record.work_hours != null ? `${record.work_hours.toFixed(1)}h` : "--"}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status.replace("_", " ")}
                      </Badge>
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
