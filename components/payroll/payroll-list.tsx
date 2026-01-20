"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, Download, Eye } from "lucide-react"
import { formatCurrency, getInitials, getStatusColor } from "@/lib/utils/helpers"
import { useState } from "react"

interface SalaryRecord {
  id: string
  month: number
  year: number
  basic_salary: number
  gross_salary: number
  net_salary: number
  payment_status: string
  employees: {
    employee_id: string
    designation: string
    users: { full_name: string }
    departments: { name: string }
  }
}

interface PayrollListProps {
  salaries: SalaryRecord[]
  month: number
  year: number
}

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export function PayrollList({ salaries, month, year }: PayrollListProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredSalaries = statusFilter === "all" ? salaries : salaries.filter((s) => s.payment_status === statusFilter)

  const stats = {
    totalPayroll: salaries.reduce((sum, s) => sum + Number(s.net_salary), 0),
    paid: salaries.filter((s) => s.payment_status === "paid").length,
    pending: salaries.filter((s) => s.payment_status === "pending").length,
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalPayroll)}</div>
            <p className="text-xs text-muted-foreground">
              {monthNames[month - 1]} {year}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <Badge className="bg-emerald-100 text-emerald-800">{stats.paid}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.paid}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Badge className="bg-amber-100 text-amber-800">{stats.pending}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="hold">On Hold</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Payroll
        </Button>
      </div>

      {/* Payroll Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Basic Salary</TableHead>
                <TableHead className="text-right">Gross Salary</TableHead>
                <TableHead className="text-right">Net Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSalaries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    No payroll records found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSalaries.map((salary) => (
                  <TableRow key={salary.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{getInitials(salary.employees.users.full_name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{salary.employees.users.full_name}</p>
                          <p className="text-xs text-muted-foreground">{salary.employees.designation}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{salary.employees.employee_id}</TableCell>
                    <TableCell>{salary.employees.departments.name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(salary.basic_salary)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(salary.gross_salary)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(salary.net_salary)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(salary.payment_status)}>{salary.payment_status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
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
