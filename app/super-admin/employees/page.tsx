import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { EmployeeList } from "@/components/employees/employee-list"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function EmployeesPage() {
  const employeesData = await prisma.employees.findMany({
    include: {
      users: {
        select: {
          id: true,
          full_name: true,
          email: true,
          avatar_url: true,
          status: true,
          role: true
        }
      },
      departments_employees_department_idTodepartments: {
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

  const employees = employeesData.map((emp: any) => ({
    ...emp,
    date_of_joining: emp.date_of_joining.toISOString(),
    date_of_birth: emp.date_of_birth?.toISOString() ?? null,
    created_at: emp.created_at.toISOString(),
    updated_at: emp.updated_at.toISOString(),
    users: {
      ...emp.users,
      avatar_url: emp.users.avatar_url ?? undefined
    },
    departments: emp.departments_employees_department_idTodepartments
  }))

  const departments = await prisma.departments.findMany({
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
          <Link href="/super-admin/employees/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </Link>
        }
      />

      <EmployeeList employees={employees} departments={departments} basePath="/super-admin" />
    </div>
  )
}