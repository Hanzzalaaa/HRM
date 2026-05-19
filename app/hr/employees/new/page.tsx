import { PageHeader } from "@/components/ui/page-header"
import { EmployeeForm } from "@/components/employees/employee-form"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export default async function HRNewEmployeePage() {
  const departments = await prisma.departments.findMany({
    select: {
      id: true,
      name: true
    }
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Add New Employee" description="Create a new employee profile and user account" />
      <EmployeeForm departments={departments} basePath="/hr" />
    </div>
  )
}
