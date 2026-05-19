import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/ui/page-header"
import { EmployeeForm } from "@/components/employees/employee-form"
import { notFound } from "next/navigation"

export const dynamic = 'force-dynamic'

interface EmployeeEditPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EmployeeEditPage({ params }: EmployeeEditPageProps) {
  const { id } = await params
  
  const employee = await prisma.employees.findUnique({
    where: { id },
    include: {
      users: {
        select: {
          id: true,
          full_name: true,
          email: true,
          avatar_url: true,
          status: true,
          role: true,
          created_at: true,
          updated_at: true
        }
      },
      departments_employees_department_idTodepartments: {
        select: {
          id: true,
          name: true,
          created_at: true,
          updated_at: true,
          description: true,
          head_id: true
        }
      }
    }
  })

  if (!employee) {
    notFound()
  }

  const formattedEmployee = {
    ...employee,
    date_of_joining: employee.date_of_joining.toISOString(),
    date_of_birth: employee.date_of_birth?.toISOString() ?? undefined,
    phone: employee.phone ?? undefined,
    address: employee.address ?? undefined,
    emergency_contact: employee.emergency_contact ?? undefined,
    bank_account: employee.bank_account ?? undefined,
    bank_name: employee.bank_name ?? undefined,
    pan_number: employee.pan_number ?? undefined,
    aadhar_number: employee.aadhar_number ?? undefined,
    user: {
      ...employee.users,
      avatar_url: employee.users.avatar_url ?? undefined,
      created_at: employee.users.created_at.toISOString(),
      updated_at: employee.users.updated_at.toISOString()
    },
    department: {
      ...employee.departments_employees_department_idTodepartments,
      created_at: employee.departments_employees_department_idTodepartments.created_at.toISOString(),
      updated_at: employee.departments_employees_department_idTodepartments.updated_at.toISOString(),
      description: employee.departments_employees_department_idTodepartments.description ?? undefined,
      head_id: employee.departments_employees_department_idTodepartments.head_id ?? undefined
    }
  }

  const departments = await prisma.departments.findMany({
    select: {
      id: true,
      name: true
    }
  })

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Edit Employee" 
        description={`Update ${employee.users.full_name}'s profile and information`} 
      />
      <EmployeeForm 
        employee={formattedEmployee} 
        departments={departments} 
        basePath="/super-admin" 
      />
    </div>
  )
}