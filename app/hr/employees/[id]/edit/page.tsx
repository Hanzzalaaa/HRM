import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/ui/page-header"
import { EmployeeForm } from "@/components/employees/employee-form"
import { notFound } from "next/navigation"

interface EmployeeEditPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function HREmployeeEditPage({ params }: EmployeeEditPageProps) {
  const { id } = await params
  
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      user: {
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
      department: {
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

  // Transform to match component's expected structure
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
      ...employee.user,
      avatar_url: employee.user.avatar_url ?? undefined,
      created_at: employee.user.created_at.toISOString(),
      updated_at: employee.user.updated_at.toISOString()
    },
    department: {
      ...employee.department,
      created_at: employee.department.created_at.toISOString(),
      updated_at: employee.department.updated_at.toISOString(),
      description: employee.department.description ?? undefined,
      head_id: employee.department.head_id ?? undefined
    }
  }

  const departments = await prisma.department.findMany({
    select: {
      id: true,
      name: true
    }
  })

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Edit Employee" 
        description={`Update ${employee.user.full_name}'s profile and information`} 
      />
      <EmployeeForm 
        employee={formattedEmployee} 
        departments={departments} 
        basePath="/hr" 
      />
    </div>
  )
}
