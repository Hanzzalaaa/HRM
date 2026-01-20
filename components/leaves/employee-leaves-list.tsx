"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Loader2, Calendar, Clock, Check, X } from "lucide-react"
import { formatDate, getStatusColor } from "@/lib/utils/helpers"

interface LeaveRecord {
  id: string
  leave_type: string
  start_date: string
  end_date: string
  total_days: number
  reason: string
  status: string
  rejection_reason?: string
  approver?: { full_name: string }
}

interface EmployeeLeavesListProps {
  leaves: LeaveRecord[]
  employeeId: string
}

export function EmployeeLeavesList({ leaves, employeeId }: EmployeeLeavesListProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: "",
  })

  const stats = {
    pending: leaves.filter((l) => l.status === "pending").length,
    approved: leaves.filter((l) => l.status === "approved").length,
    rejected: leaves.filter((l) => l.status === "rejected").length,
  }

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  const handleSubmit = async () => {
    if (!formData.leave_type || !formData.start_date || !formData.end_date || !formData.reason) return

    setLoading(true)
    try {
      const response = await fetch('/api/leaves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_id: employeeId,
          leave_type: formData.leave_type,
          start_date: formData.start_date,
          end_date: formData.end_date,
          total_days: calculateDays(formData.start_date, formData.end_date),
          reason: formData.reason,
          status: "pending",
        }),
      })

      if (response.ok) {
        setOpen(false)
        setFormData({ leave_type: "", start_date: "", end_date: "", reason: "" })
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (leaveId: string) => {
    await fetch(`/api/leaves/${leaveId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: "cancelled" }),
    })
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <Check className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <X className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Apply Leave Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Apply for Leave
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for Leave</DialogTitle>
            <DialogDescription>Submit a new leave request for approval</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Leave Type</Label>
              <Select value={formData.leave_type} onValueChange={(v) => setFormData((p) => ({ ...p, leave_type: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual">Annual Leave</SelectItem>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="personal">Personal Leave</SelectItem>
                  <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData((p) => ({ ...p, start_date: e.target.value }))}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData((p) => ({ ...p, end_date: e.target.value }))}
                  min={formData.start_date || new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
            {formData.start_date && formData.end_date && (
              <p className="text-sm text-muted-foreground">
                <Calendar className="inline h-4 w-4 mr-1" />
                Total days: {calculateDays(formData.start_date, formData.end_date)}
              </p>
            )}
            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea
                value={formData.reason}
                onChange={(e) => setFormData((p) => ({ ...p, reason: e.target.value }))}
                placeholder="Please provide a reason for your leave request"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                loading || !formData.leave_type || !formData.start_date || !formData.end_date || !formData.reason
              }
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leaves Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leave History</CardTitle>
          <CardDescription>All your leave requests</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaves.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No leave requests found.
                  </TableCell>
                </TableRow>
              ) : (
                leaves.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {leave.leave_type.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(leave.start_date)}</TableCell>
                    <TableCell>{formatDate(leave.end_date)}</TableCell>
                    <TableCell>{leave.total_days}</TableCell>
                    <TableCell>
                      <div className="max-w-[200px]">
                        <p className="truncate">{leave.reason}</p>
                        {leave.status === 'rejected' && leave.rejection_reason && (
                          <p className="text-xs text-red-600 mt-1">
                            <span className="font-medium">Rejection reason:</span> {leave.rejection_reason}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge className={getStatusColor(leave.status)}>{leave.status}</Badge>
                        {leave.approver && (
                          <p className="text-xs text-muted-foreground">by {leave.approver.full_name}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {leave.status === "pending" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleCancel(leave.id)}
                        >
                          Cancel
                        </Button>
                      )}
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
