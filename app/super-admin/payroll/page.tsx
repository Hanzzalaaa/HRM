import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/ui/page-header"
import { PayrollList } from "@/components/payroll/payroll-list"

export default async function PayrollPage() {
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const salariesData = await prisma.salaries.findMany({
    where: { month: currentMonth, year: currentYear },
    include: {
      employees: {
        select: {
          employee_id: true,
          designation: true,
          users: { select: { full_name: true } },
          departments_employees_department_idTodepartments: { select: { name: true } }
        }
      }
    },
    orderBy: { created_at: 'desc' }
  })

  const salaries = salariesData.map((salary: any) => ({
    ...salary,
    created_at: salary.created_at.toISOString(),
    updated_at: salary.updated_at.toISOString(),
    payment_date: salary.payment_date?.toISOString() ?? null,
    employees: {
      employee_id: salary.employees.employee_id,
      designation: salary.employees.designation,
      users: salary.employees.users,
      departments: salary.employees.departments_employees_department_idTodepartments
    }
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll Management"
        description="Manage employee salaries and payroll"
      />
      <PayrollList salaries={salaries} month={currentMonth} year={currentYear} />
    </div>
  )
}