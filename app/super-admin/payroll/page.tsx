import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { PayrollList } from "@/components/payroll/payroll-list"

export default async function PayrollPage() {
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const salariesData = await prisma.salary.findMany({
    where: {
      month: currentMonth,
      year: currentYear
    },
    include: {
      employee: {
        select: {
          employee_id: true,
          designation: true,
          user: {
            select: {
              full_name: true
            }
          },
          department: {
            select: {
              name: true
            }
          }
        }
      }
    },
    orderBy: {
      created_at: 'desc'
    }
  })

  // Transform to match component's expected structure
  const salaries = salariesData.map((salary: any) => ({
    ...salary,
    created_at: salary.created_at.toISOString(),
    updated_at: salary.updated_at.toISOString(),
    payment_date: salary.payment_date?.toISOString() ?? null,
    employees: {
      employee_id: salary.employee.employee_id,
      designation: salary.employee.designation,
      users: salary.employee.user,
      departments: salary.employee.department
    }
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll Management"
        description="Manage employee salaries and payroll"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Generate Payroll
          </Button>
        }
      />

      <PayrollList salaries={salaries} month={currentMonth} year={currentYear} />
    </div>
  )
}
