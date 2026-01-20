"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar, Check, X, Clock, Loader2 } from "lucide-react"
import { formatDate, getInitials, getStatusColor } from "@/lib/utils/helpers"

interface LeaveRecord {
  id: string
  leave_type: string
  start_date: string
  end_date: string
  total_days: number
  reason: string
  status: string
  rejection_reason?: string
  employees: {
    employee_id: string
    users: { full_name: string; avatar_url?: string }
    departments: { name: string }
  }
  approver?: { full_name: string }
}

interface LeavesListProps {
  leaves: LeaveRecord[]
  isAdmin?: boolean
}

export function LeavesList({ leaves, isAdmin = false }: LeavesListProps) {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedLeave, setSelectedLeave] = useState<LeaveRecord | null>(null)
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [loading, setLoading] = useState(false)

  const filteredLeaves = statusFilter === "all" ? leaves : leaves.filter((l) => l.status === statusFilter)

  const stats = {
    pending: leaves.filter((l) => l.status === "pending").length,
    approved: leaves.filter((l) => l.status === "approved").length,
    rejected: leaves.filter((l) => l.status === "rejected").length,
  }

  const handleAction = async () => {
    if (!selectedLeave || !actionType) return

    setLoading(true)
    try {
      // Get current user from API
      const userResponse = await fetch('/api/auth/me')
      const userData = await userResponse.json()

      if (!userData.user) {
        throw new Error('Not authenticated')
      }

      // Update leave status
      await fetch(`/api/leaves/${selectedLeave.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: actionType === "approve" ? "approved" : "rejected",
          approved_by: userData.user.id,
          rejection_reason: actionType === "reject" ? rejectionReason : null,
        }),
      })

      router.refresh()
    } finally {
      setLoading(false)
      setSelectedLeave(null)
      setActionType(null)
      setRejectionReason("")
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      {isAdmin && (
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
      )}

      {/* Filter */}
      <div className="flex items-center justify-between">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Leaves Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {isAdmin && <TableHead>Employee</TableHead>}
                <TableHead>Leave Type</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                {isAdmin && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeaves.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 8 : 6} className="h-24 text-center text-muted-foreground">
                    No leave requests found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeaves.map((leave) => (
                  <TableRow key={leave.id}>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{getInitials(leave.employees.users.full_name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{leave.employees.users.full_name}</p>
                            <p className="text-xs text-muted-foreground">{leave.employees.departments.name}</p>
                          </div>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {leave.leave_type.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(leave.start_date)}</TableCell>
                    <TableCell>{formatDate(leave.end_date)}</TableCell>
                    <TableCell>{leave.total_days}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{leave.reason}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(leave.status)}>{leave.status}</Badge>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        {leave.status === "pending" && (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-emerald-600 hover:text-emerald-700 bg-transparent"
                              onClick={() => {
                                setSelectedLeave(leave)
                                setActionType("approve")
                              }}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-red-600 hover:text-red-700 bg-transparent"
                              onClick={() => {
                                setSelectedLeave(leave)
                                setActionType("reject")
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog
        open={!!selectedLeave && !!actionType}
        onOpenChange={() => {
          setSelectedLeave(null)
          setActionType(null)
          setRejectionReason("")
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionType === "approve" ? "Approve" : "Reject"} Leave Request</DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "Are you sure you want to approve this leave request?"
                : "Please provide a reason for rejecting this leave request."}
            </DialogDescription>
          </DialogHeader>

          {selectedLeave && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {formatDate(selectedLeave.start_date)} - {formatDate(selectedLeave.end_date)} (
                    {selectedLeave.total_days} days)
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{selectedLeave.reason}</p>
              </div>

              {actionType === "reject" && (
                <div className="space-y-2">
                  <Label htmlFor="rejection_reason">Rejection Reason</Label>
                  <Textarea
                    id="rejection_reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection"
                    required
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedLeave(null)
                setActionType(null)
                setRejectionReason("")
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={loading || (actionType === "reject" && !rejectionReason)}
              variant={actionType === "approve" ? "default" : "destructive"}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : actionType === "approve" ? (
                "Approve"
              ) : (
                "Reject"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
