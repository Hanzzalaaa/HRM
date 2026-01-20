import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { DepartmentList } from "@/components/departments/department-list"

export default async function HRDepartmentsPage() {
  const departmentsData = await prisma.department.findMany({
    include: {
      head: {
        select: {
          id: true,
          user: {
            select: {
              full_name: true
            }
          }
        }
      },
      _count: {
        select: {
          employees: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  })

  // Transform to match component's expected structure
  const departments = departmentsData.map((dept: any) => ({
    ...dept,
    description: dept.description ?? undefined,
    head_id: dept.head_id ?? undefined,
    created_at: dept.created_at.toISOString(),
    updated_at: dept.updated_at.toISOString(),
    head: dept.head ? {
      id: dept.head.id,
      users: dept.head.user
    } : undefined,
    employeeCount: dept._count.employees
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        description="Manage organizational departments"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Department
          </Button>
        }
      />

      <DepartmentList departments={departments} />
    </div>
  )
}
