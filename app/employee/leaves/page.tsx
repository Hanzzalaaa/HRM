import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/ui/page-header"
import { EmployeeLeavesList } from "@/components/leaves/employee-leaves-list"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function EmployeeLeavesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const employee = await prisma.employees.findUnique({
    where: { user_id: user.id },
    select: { id: true }
  })

  if (!employee) return null

  const leaves = await prisma.leaves.findMany({
    where: {
      employee_id: employee.id
    },
    include: {
      users: {
        select: {
          full_name: true
        }
      }
    },
    orderBy: {
      created_at: 'desc'
    }
  })

  const formattedLeaves = leaves.map((leave: any) => ({
    ...leave,
    start_date: leave.start_date.toISOString(),
    end_date: leave.end_date.toISOString(),
    created_at: leave.created_at.toISOString(),
    updated_at: leave.updated_at.toISOString(),
    approved_at: leave.approved_at?.toISOString() ?? undefined,
    approved_by: leave.approved_by ?? undefined,
    rejection_reason: leave.rejection_reason ?? undefined,
    approver: leave.users ?? undefined
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Leaves"
        description="View and manage your leave requests"
      />

      <EmployeeLeavesList leaves={formattedLeaves} employeeId={employee.id} />
    </div>
  )
}