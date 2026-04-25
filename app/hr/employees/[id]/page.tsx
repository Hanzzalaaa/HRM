import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChangePasswordDialog } from "@/components/employees/change-password-dialog"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Pencil, ArrowLeft } from "lucide-react"

export const dynamic = 'force-dynamic'

interface EmployeeViewPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function HREmployeeViewPage({ params }: EmployeeViewPageProps) {
  const { id } = await params
  
  const employee = await prisma.employees.findUnique({
    where: { id },
    include: {
      users: true,
      departments_employees_department_idTodepartments: true
    }
  })

  if (!employee) {
    notFound()
  }

  const dept = employee.departments_employees_department_idTodepartments

  return (
    <div className="space-y-6">
      <PageHeader 
        title={employee.users.full_name}
        description={`${employee.designation} - ${dept.name}`}
        actions={
          <div className="flex gap-2">
            <Link href="/hr/employees">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Employees
              </Button>
            </Link>
            <ChangePasswordDialog 
              employeeId={id} 
              employeeName={employee.users.full_name} 
            />
            <Link href={`/hr/employees/${id}/edit`}>
              <Button>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Employee
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Employee ID</p>
              <p className="font-medium">{employee.employee_id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-medium">{employee.users.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{employee.users.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{employee.phone || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date of Birth</p>
              <p className="font-medium">
                {employee.date_of_birth 
                  ? new Date(employee.date_of_birth).toLocaleDateString() 
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">{employee.address || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Department</p>
              <p className="font-medium">{dept.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Designation</p>
              <p className="font-medium">{employee.designation}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Employment Type</p>
              <p className="font-medium capitalize">{employee.employment_type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date of Joining</p>
              <p className="font-medium">
                {new Date(employee.date_of_joining).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="font-medium capitalize">{employee.users.role}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium capitalize">{employee.users.status}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Basic Salary</p>
              <p className="font-medium">
                {employee.basic_salary 
                  ? `PKR ${employee.basic_salary.toLocaleString()}` 
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bank Account</p>
              <p className="font-medium">{employee.bank_account || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bank Name</p>
              <p className="font-medium">{employee.bank_name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">PAN Number</p>
              <p className="font-medium">{employee.pan_number || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aadhar Number</p>
              <p className="font-medium">{employee.aadhar_number || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{employee.emergency_contact || "N/A"}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}