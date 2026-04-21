import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/ui/page-header"
import { LeavesList } from "@/components/leaves/leaves-list"

export default async function HRLeavesPage() {
 const leavesData = await prisma.leaves.findMany({
  include: {
    employees: {
      select: {
        employee_id: true,

        users: {
          select: {
            full_name: true,
            avatar_url: true
          }
        },

        departments_employees_department_idTodepartments: {
          select: {
            name: true
          }
        }
      }
    }
  },
  orderBy: {
    created_at: "desc"
  }
})
  // Transform to match component's expected structure
  const leaves = leavesData.map((leave: any) => ({
    ...leave,
    start_date: leave.start_date.toISOString(),
    end_date: leave.end_date.toISOString(),
    approved_at: leave.approved_at?.toISOString() ?? undefined,
    created_at: leave.created_at.toISOString(),
    updated_at: leave.updated_at.toISOString(),
    rejection_reason: leave.rejection_reason ?? undefined,
    employees: {
      employee_id: leave.employee.employee_id,
      users: {
        full_name: leave.employee.user.full_name,
        avatar_url: leave.employee.user.avatar_url ?? undefined
      },
      departments: leave.employee.department
    },
    approver: leave.approver ?? undefined
  }))

  return (
    <div className="space-y-6">
      <PageHeader title="Leave Management" description="Review and manage leave requests" />

      <LeavesList leaves={leaves} isAdmin={true} />
    </div>
  )
}
