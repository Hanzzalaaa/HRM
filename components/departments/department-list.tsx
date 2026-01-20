"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Users, Edit, Trash2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils/helpers"

interface Department {
  id: string
  name: string
  description?: string
  head?: {
    id: string
    users: { full_name: string }
  }
  employeeCount: number
}

interface DepartmentListProps {
  departments: Department[]
}

export function DepartmentList({ departments }: DepartmentListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {departments.map((department) => (
        <Card key={department.id}>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-lg">{department.name}</CardTitle>
              <CardDescription className="mt-1">{department.description || "No description"}</CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{department.employeeCount} employees</span>
              </div>
              {department.head && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px]">
                      {getInitials(department.head.users.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{department.head.users.full_name}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
