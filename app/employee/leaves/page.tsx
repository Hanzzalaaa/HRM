import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { EmployeeLeavesList } from "@/components/leaves/employee-leaves-list"
import { redirect } from "next/navigation"

export default async function EmployeeLeavesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const employee = await prisma.employee.findUnique({
    where: { user_id: user.id },
    select: { id: true }
  })

  if (!employee) return null

  const leaves = await prisma.leave.findMany({
    where: {
      employee_id: employee.id
    },
    include: {
      approver: {
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
    approver: leave.approver ?? undefined
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Leaves"
        description="View and manage your leave requests"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Apply for Leave
          </Button>
        }
      />

      <EmployeeLeavesList leaves={formattedLeaves} employeeId={employee.id} />
    </div>
  )
}
