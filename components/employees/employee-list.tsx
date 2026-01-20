"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, MoreHorizontal, Eye, Edit, Trash2, ChevronLeft, ChevronRight, Key } from "lucide-react"
import { formatDate, getInitials, getStatusColor } from "@/lib/utils/helpers"
import { ChangePasswordDialog } from "@/components/employees/change-password-dialog"
import Link from "next/link"

interface Employee {
  id: string
  employee_id: string
  designation: string
  employment_type: string
  date_of_joining: string
  users: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
    status: string
    role: string
  }
  departments: {
    id: string
    name: string
  }
}

interface EmployeeListProps {
  employees: Employee[]
  departments: { id: string; name: string }[]
  basePath: string
}

export function EmployeeList({ employees, departments, basePath }: EmployeeListProps) {
  const [search, setSearch] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<{ id: string; name: string } | null>(null)
  const pageSize = 10

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.users.full_name.toLowerCase().includes(search.toLowerCase()) ||
      employee.users.email.toLowerCase().includes(search.toLowerCase()) ||
      employee.employee_id.toLowerCase().includes(search.toLowerCase())

    const matchesDepartment = departmentFilter === "all" || employee.departments.id === departmentFilter
    const matchesStatus = statusFilter === "all" || employee.users.status === statusFilter

    return matchesSearch && matchesDepartment && matchesStatus
  })

  const totalPages = Math.ceil(filteredEmployees.length / pageSize)
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or employee ID..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={departmentFilter}
              onValueChange={(value) => {
                setDepartmentFilter(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Employee Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    No employees found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={employee.users.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback>{getInitials(employee.users.full_name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{employee.users.full_name}</p>
                          <p className="text-xs text-muted-foreground">{employee.users.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{employee.employee_id}</TableCell>
                    <TableCell>{employee.departments.name}</TableCell>
                    <TableCell>{employee.designation}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {employee.employment_type.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(employee.date_of_joining)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(employee.users.status)}>{employee.users.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`${basePath}/employees/${employee.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`${basePath}/employees/${employee.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => {
                              setSelectedEmployee({ id: employee.id, name: employee.users.full_name })
                              setPasswordDialogOpen(true)
                            }}
                          >
                            <Key className="mr-2 h-4 w-4" />
                            Change Password
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredEmployees.length)}{" "}
            of {filteredEmployees.length} employees
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Password Change Dialog */}
      {selectedEmployee && (
        <ChangePasswordDialog
          employeeId={selectedEmployee.id}
          employeeName={selectedEmployee.name}
          open={passwordDialogOpen}
          onOpenChange={setPasswordDialogOpen}
        />
      )}
    </div>
  )
}
