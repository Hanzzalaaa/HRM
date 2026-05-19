import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/ui/page-header"
import { DepartmentList } from "@/components/departments/department-list"

export const dynamic = 'force-dynamic'

export default async function HRDepartmentsPage() {
  const departmentsData = await prisma.departments.findMany({
    include: {
      employees_departments_head_idToemployees: {
        select: {
          id: true,
          users: {
            select: {
              full_name: true
            }
          }
        }
      },
      _count: {
        select: {
          employees_employees_department_idTodepartments: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  })

  const departments = departmentsData.map((dept: any) => ({
    ...dept,
    description: dept.description ?? undefined,
    head_id: dept.head_id ?? undefined,
    created_at: dept.created_at.toISOString(),
    updated_at: dept.updated_at.toISOString(),
    head: dept.employees_departments_head_idToemployees ? {
      id: dept.employees_departments_head_idToemployees.id,
      users: dept.employees_departments_head_idToemployees.users
    } : undefined,
    employeeCount: dept._count.employees_employees_department_idTodepartments
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        description="Manage organizational departments"
      />
      <DepartmentList departments={departments} />
    </div>
  )
}