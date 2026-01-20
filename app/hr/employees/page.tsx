import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { EmployeeList } from "@/components/employees/employee-list"
import Link from "next/link"

export default async function HREmployeesPage() {
  const employeesData = await prisma.employee.findMany({
    include: {
      user: {
        select: {
          id: true,
          full_name: true,
          email: true,
          avatar_url: true,
          status: true,
          role: true
        }
      },
      department: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      created_at: 'desc'
    }
  })

  // Transform to match component's expected structure
  const employees = employeesData.map((emp: any) => ({
    ...emp,
    date_of_joining: emp.date_of_joining.toISOString(),
    date_of_birth: emp.date_of_birth?.toISOString() ?? null,
    created_at: emp.created_at.toISOString(),
    updated_at: emp.updated_at.toISOString(),
    users: {
      ...emp.user,
      avatar_url: emp.user.avatar_url ?? undefined
    },
    departments: emp.department
  }))

  const departments = await prisma.department.findMany({
    select: {
      id: true,
      name: true
    }
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description="Manage all employees in the organization"
        actions={
          <Link href="/hr/employees/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </Link>
        }
      />

      <EmployeeList employees={employees} departments={departments} basePath="/hr" />
    </div>
  )
}
