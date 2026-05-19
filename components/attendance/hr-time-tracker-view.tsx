"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"
import { formatDate, formatTime, getStatusColor } from "@/lib/utils/helpers"
import { WorkTimer } from "@/components/attendance/work-timer"

interface AttendanceRecord {
  id: string
  employeeName: string
  employmentType: string
  date: string
  check_in?: string
  check_out?: string
  status: string
  work_hours?: number
}

interface HRTimeTrackerViewProps {
  records: AttendanceRecord[]
}

export function HRTimeTrackerView({ records }: HRTimeTrackerViewProps) {
  const today = new Date().toISOString().split("T")[0]

  const checkedIn = records.filter(r => r.check_in && !r.check_out)
  const checkedOut = records.filter(r => r.check_in && r.check_out)
  const notCheckedIn = records.filter(r => !r.check_in)

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-green-500">{checkedIn.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Currently Working</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-blue-500">{checkedOut.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Checked Out</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-muted-foreground">{notCheckedIn.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Not Checked In</p>
          </CardContent>
        </Card>
      </div>

      {/* Live timers for checked-in employees */}
      {checkedIn.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Currently Working
            </CardTitle>
            <CardDescription>{formatDate(today)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {checkedIn.map((record) => {
              const shiftHours = record.employmentType === "part_time" ? 4 : 9
              return (
                <div key={record.id} className="space-y-2">
                  <p className="font-medium text-sm">{record.employeeName}</p>
                  <WorkTimer
                    checkInTime={record.check_in!}
                    shiftHours={shiftHours}
                  />
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* All records table */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Attendance Log</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No attendance records for today yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Work Hours</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.employeeName}</TableCell>
                    <TableCell>{record.check_in ? formatTime(record.check_in) : "--:--"}</TableCell>
                    <TableCell>{record.check_out ? formatTime(record.check_out) : "--:--"}</TableCell>
                    <TableCell>{record.work_hours ? `${record.work_hours.toFixed(1)}h` : "--"}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}